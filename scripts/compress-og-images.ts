/**
 * Compress OG images in place.
 *
 * Many "jpg" files are actually ~2MB PNGs (1376×768). Social/OG use only needs
 * ~1200×630 real JPEGs. This rewrites content/assets/og-images/** as mozjpeg
 * (max width 1200, q=80), keeping the original path when the result is smaller.
 *
 * Usage:
 *   npm run compress-og-images
 *   npx tsx scripts/compress-og-images.ts --dry-run
 *   npx tsx scripts/compress-og-images.ts --force   # rewrite even if already small
 */
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';

const ROOT = process.cwd();
const OG_DIR = path.join(ROOT, 'content', 'assets', 'og-images');
const WIDTH = 1200;
const QUALITY = 80;
/** Skip files already at/under this size unless --force */
const SKIP_UNDER_BYTES = 250 * 1024;

async function compressOne(
  src: string,
  opts: { dryRun: boolean; force: boolean }
): Promise<{ rel: string; before: number; after: number; action: string }> {
  const rel = path.relative(ROOT, src);
  const before = (await fs.stat(src)).size;

  if (!opts.force && before <= SKIP_UNDER_BYTES) {
    return { rel, before, after: before, action: 'skip-small' };
  }

  const meta = await sharp(src).metadata();
  const outPath = src.replace(/\.(png|webp)$/i, '.jpg');

  const buffer = await sharp(src)
    .rotate()
    .resize({
      width: WIDTH,
      height: Math.round(WIDTH * 630 / 1200),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  if (buffer.length >= before && !opts.force) {
    return { rel, before, after: before, action: 'skip-no-gain' };
  }

  if (!opts.dryRun) {
    // Write via temp + rename so in-place replace isn't blocked by AV/locks
    const tmpPath = `${outPath}.tmp-${process.pid}.jpg`;
    await fs.writeFile(tmpPath, buffer);
    await fs.rename(tmpPath, outPath);
    // If we converted png/webp → jpg, remove the old file when path changed
    if (outPath !== src) {
      await fs.unlink(src).catch(() => {});
    }
  }

  const fmt = meta.format || '?';
  return {
    rel: path.relative(ROOT, outPath),
    before,
    after: buffer.length,
    action: opts.dryRun ? `dry(${fmt})` : `ok(${fmt}→jpg)`,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');

  const files = await glob('**/*.{jpg,jpeg,png,webp}', {
    cwd: OG_DIR,
    nodir: true,
    absolute: true,
  });

  console.log(
    `Compressing ${files.length} OG images → max ${WIDTH}px q=${QUALITY}` +
      (dryRun ? ' (dry-run)' : '') +
      (force ? ' (force)' : '')
  );

  let saved = 0;
  let beforeTotal = 0;
  let afterTotal = 0;
  let rewritten = 0;
  let skipped = 0;

  const concurrency = 6;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map((f) => compressOne(f, { dryRun, force }))
    );
    for (const r of results) {
      beforeTotal += r.before;
      afterTotal += r.after;
      const pct = r.before ? Math.round((1 - r.after / r.before) * 100) : 0;
      if (r.action.startsWith('ok') || r.action.startsWith('dry')) {
        rewritten++;
        saved += r.before - r.after;
        console.log(
          `  [${r.action}] ${r.rel}: ${(r.before / 1024).toFixed(0)}KB → ${(r.after / 1024).toFixed(0)}KB (−${pct}%)`
        );
      } else {
        skipped++;
      }
    }
  }

  console.log(
    `\nDone. rewritten=${rewritten} skipped=${skipped}` +
      ` before=${(beforeTotal / 1024 / 1024).toFixed(1)}MB` +
      ` after=${(afterTotal / 1024 / 1024).toFixed(1)}MB` +
      ` saved=${(saved / 1024 / 1024).toFixed(1)}MB`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
