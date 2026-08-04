/**
 * Generate lightweight card images for the homepage/post grids.
 *
 * Source OG images are often ~1–2MB PNG-in-.jpg files (1376×768). Cards only
 * display at ~200px tall, so we emit ~720px-wide JPEGs (~30–60KB) under
 * content/assets/cards/ mirroring the og-images tree.
 *
 * Usage:
 *   npx tsx scripts/generate-card-images.ts
 *   npx tsx scripts/generate-card-images.ts --force
 */
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';

const ROOT = process.cwd();
const OG_DIR = path.join(ROOT, 'content', 'assets', 'og-images');
const CARDS_DIR = path.join(ROOT, 'content', 'assets', 'cards');
const WIDTH = 720;
const QUALITY = 78;

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
    .rotate() // honor EXIF orientation
    .resize({ width: WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  await fs.writeFile(dest, buffer);
  return { src, dest, bytes: buffer.length };
}

async function main() {
  const force = process.argv.includes('--force');
  const files = await glob('**/*.{jpg,jpeg,png,webp}', {
    cwd: OG_DIR,
    nodir: true,
    absolute: true,
  });

  console.log(`Found ${files.length} OG images → cards @ ${WIDTH}px q=${QUALITY}`);

  let written = 0;
  let skipped = 0;
  let totalBytes = 0;

  // Limit concurrency so we don't melt laptops
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
      const kb = (r.bytes / 1024).toFixed(1);
      console.log(`  [OK] ${path.relative(ROOT, r.dest)} (${kb} KB)`);
    }
  }

  console.log(`\nDone. wrote=${written} skipped=${skipped} total=${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
