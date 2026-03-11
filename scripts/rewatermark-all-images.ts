/**
 * One-off script: Re-apply WarOnDisease.org watermark to all existing generated images.
 *
 * This strips any old watermark by re-generating from the original AI output
 * (which we don't have), so instead it applies the new watermark on top.
 * For a clean result, re-run `npm run generate-images` after this to regenerate from scratch.
 *
 * Usage: npx tsx scripts/rewatermark-all-images.ts
 */

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

const IMAGE_DIRS = [
  'content/assets/og-images',
  'content/assets/infographics',
  'content/assets/thumbnails',
]

async function addWatermarkToFile(filePath: string): Promise<boolean> {
  const sharp = (await import('sharp')).default

  try {
    const inputBuffer = await fs.readFile(filePath)
    const image = sharp(inputBuffer)
    const meta = await image.metadata()
    const imageWidth = meta.width || 1200
    const imageHeight = meta.height || 630

    // Small watermark: 1.2% of image width, flush to bottom-right corner
    const fontSize = Math.max(10, Math.floor(imageWidth * 0.012))
    const boxPadX = Math.floor(fontSize * 0.4)
    const boxPadY = Math.floor(fontSize * 0.2)
    const border = Math.max(1, Math.round(fontSize * 0.08))

    const text = 'WarOnDisease.org'
    const textW = Math.ceil(text.length * fontSize * 0.6)
    const textH = Math.ceil(fontSize * 1.15)
    const badgeW = textW + boxPadX * 2
    const badgeH = textH + boxPadY * 2

    const svgText = `
      <svg width="${badgeW}" height="${badgeH}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${border / 2}" y="${border / 2}"
              width="${badgeW - border}" height="${badgeH - border}"
              fill="white" stroke="black" stroke-width="${border}"/>
        <text x="${boxPadX}" y="${boxPadY + textH * 0.82}"
              font-family="Courier New, monospace"
              font-size="${fontSize}px"
              font-weight="600"
              fill="black">${text}</text>
      </svg>
    `

    const svgBuffer = Buffer.from(svgText)
    const left = imageWidth - badgeW
    const top = imageHeight - badgeH

    const outputBuffer = await image
      .composite([{ input: svgBuffer, left, top }])
      .toBuffer()

    await fs.writeFile(filePath, outputBuffer)
    return true
  } catch (error: any) {
    console.error(`  [ERROR] ${filePath}: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('Re-watermarking all existing generated images with WarOnDisease.org')
  console.log('='.repeat(60))

  let totalProcessed = 0
  let totalSuccess = 0
  let totalFailed = 0

  for (const dir of IMAGE_DIRS) {
    const exists = await fs.access(dir).then(() => true).catch(() => false)
    if (!exists) {
      console.log(`\n[SKIP] Directory not found: ${dir}`)
      continue
    }

    const files = await glob(`${dir}/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}`)
    console.log(`\n[*] ${dir}: ${files.length} image(s)`)

    for (const file of files) {
      totalProcessed++
      process.stdout.write(`  [${totalProcessed}] ${path.basename(file)}...`)
      const ok = await addWatermarkToFile(file)
      if (ok) {
        totalSuccess++
        console.log(' OK')
      } else {
        totalFailed++
        console.log(' FAILED')
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Done. ${totalSuccess}/${totalProcessed} images watermarked. ${totalFailed} failed.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
