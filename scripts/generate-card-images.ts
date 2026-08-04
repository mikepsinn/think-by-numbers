/**
 * Generate lightweight card images for the homepage/post grids, and write
 * metadata.media.card into each post's frontmatter so templates can use the
 * path directly (no URL rewriting at render time).
 *
 * Usage:
 *   npx tsx scripts/generate-card-images.ts
 *   npx tsx scripts/generate-card-images.ts --force
 *   npx tsx scripts/generate-card-images.ts --frontmatter-only
 */
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import sharp from 'sharp';

const ROOT = process.cwd();
const OG_DIR = path.join(ROOT, 'content', 'assets', 'og-images');
const CARDS_DIR = path.join(ROOT, 'content', 'assets', 'cards');
const WIDTH = 720;
const QUALITY = 78;

function ogPathToCardPath(ogUrl: string): string | null {
  if (!ogUrl || typeof ogUrl !== 'string') return null;
  if (!ogUrl.startsWith('/assets/og-images/')) return null;
  return ogUrl
    .replace('/assets/og-images/', '/assets/cards/')
    .replace(/\.(png|webp)$/i, '.jpg');
}

async function needsRebuild(src: string, dest: string, force: boolean): Promise<boolean> {
  if (force) return true;
  try {
    const [srcStat, destStat] = await Promise.all([fs.stat(src), fs.stat(dest)]);
    return srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
}

async function generateCard(src: string, force: boolean): Promise<{ src: string; dest: string; bytes: number } | null> {
  const rel = path.relative(OG_DIR, src);
  const dest = path.join(CARDS_DIR, rel).replace(/\.(png|webp)$/i, '.jpg');

  if (!(await needsRebuild(src, dest, force))) {
    return null;
  }

  await fs.mkdir(path.dirname(dest), { recursive: true });

  const buffer = await sharp(src)
    .rotate()
    .resize({ width: WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  await fs.writeFile(dest, buffer);
  return { src, dest, bytes: buffer.length };
}

/** Point each post's metadata.media.card at the matching cards/ asset. */
async function syncFrontmatter(): Promise<{ updated: number; skipped: number }> {
  const posts = await glob('content/**/*.md', {
    ignore: ['**/node_modules/**', '**/_site/**'],
    absolute: true,
  });

  let updated = 0;
  let skipped = 0;

  for (const filePath of posts) {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const ogUrl = data?.metadata?.media?.ogImage as string | undefined;
    const cardUrl = ogPathToCardPath(ogUrl || '');

    if (!cardUrl) {
      skipped++;
      continue;
    }

    const cardAbs = path.join(ROOT, 'content', cardUrl.replace(/^\//, ''));
    try {
      await fs.access(cardAbs);
    } catch {
      skipped++;
      continue;
    }

    if (data.metadata?.media?.card === cardUrl) {
      skipped++;
      continue;
    }

    data.metadata = data.metadata || {};
    data.metadata.media = data.metadata.media || {};
    data.metadata.media.card = cardUrl;

    await fs.writeFile(filePath, matter.stringify(content, data), 'utf-8');
    updated++;
    console.log(`  [FM] ${path.relative(ROOT, filePath)} → ${cardUrl}`);
  }

  return { updated, skipped };
}

async function main() {
  const force = process.argv.includes('--force');
  const frontmatterOnly = process.argv.includes('--frontmatter-only');

  if (!frontmatterOnly) {
    const files = await glob('**/*.{jpg,jpeg,png,webp}', {
      cwd: OG_DIR,
      nodir: true,
      absolute: true,
    });

    console.log(`Found ${files.length} OG images → cards @ ${WIDTH}px q=${QUALITY}`);

    let written = 0;
    let skipped = 0;
    let totalBytes = 0;

    const concurrency = 6;
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      const results = await Promise.all(batch.map((f) => generateCard(f, force)));
      for (const r of results) {
        if (!r) {
          skipped++;
          continue;
        }
        written++;
        totalBytes += r.bytes;
        console.log(`  [OK] ${path.relative(ROOT, r.dest)} (${(r.bytes / 1024).toFixed(1)} KB)`);
      }
    }

    console.log(`\nCards: wrote=${written} skipped=${skipped} total=${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('\nSyncing metadata.media.card in frontmatter…');
  const fm = await syncFrontmatter();
  console.log(`Frontmatter: updated=${fm.updated} unchanged=${fm.skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
