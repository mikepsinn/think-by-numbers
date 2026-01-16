/**
 * Update EXIF metadata on existing images used in posts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImageMetadata {
  title: string;
  description: string;
  author: string;
  copyright: string;
  keywords: string[];
  createDate: Date;
}

/**
 * Extract image paths from markdown content
 */
function extractImagePaths(content: string): string[] {
  const images: string[] = [];

  // Markdown images: ![alt](path)
  const mdImageRegex = /!\[[^\]]*\]\(([^)\s]+)/g;
  let match;
  while ((match = mdImageRegex.exec(content)) !== null) {
    const imgPath = match[1].split('?')[0]; // Remove query params
    if (imgPath.startsWith('/') && !imgPath.startsWith('//')) {
      images.push(imgPath);
    }
  }

  // HTML img tags: src="path" or src='path'
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const imgPath = match[1].split('?')[0];
    if (imgPath.startsWith('/') && !imgPath.startsWith('//')) {
      images.push(imgPath);
    }
  }

  // Deduplicate
  return [...new Set(images)];
}

/**
 * Update EXIF metadata on an image file
 */
async function updateImageMetadata(
  imagePath: string,
  metadata: ImageMetadata
): Promise<boolean> {
  try {
    // Read the image
    const imageBuffer = await fs.readFile(imagePath);

    // Check if it's a supported format
    const ext = path.extname(imagePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext)) {
      return false;
    }

    // Prepare EXIF data
    const exifData: any = { IFD0: {} };
    if (metadata.title) exifData.IFD0.DocumentName = metadata.title;
    if (metadata.author) exifData.IFD0.Artist = metadata.author;
    if (metadata.copyright) exifData.IFD0.Copyright = metadata.copyright;

    // Build description with keywords for SEO
    let description = metadata.description || '';
    if (metadata.keywords?.length) {
      const keywordStr = metadata.keywords.join(', ');
      description = description ? `${description} | ${keywordStr}` : keywordStr;
    }
    if (description) exifData.IFD0.ImageDescription = description;

    // Add creation date
    if (metadata.createDate) {
      exifData.IFD0.DateTime = metadata.createDate.toISOString().replace('T', ' ').substring(0, 19);
    }

    // Process with sharp
    const processedBuffer = await sharp(imageBuffer)
      .withExif(exifData)
      .toBuffer();

    // Write back
    await fs.writeFile(imagePath, processedBuffer);

    return true;
  } catch (error: any) {
    // Some images may not support EXIF (like GIFs)
    if (error.message?.includes('unsupported') || error.message?.includes('GIF')) {
      return false;
    }
    throw error;
  }
}

/**
 * Find all markdown files recursively
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const mdFiles: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '_site', '.git', 'old-simply-static-export'].includes(entry.name)) {
          mdFiles.push(...await findMarkdownFiles(fullPath));
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        mdFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return mdFiles;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const contentDir = path.join(projectRoot, 'content');

  console.log('Updating EXIF metadata on existing images...\n');

  // Find all markdown files
  const mdFiles = await findMarkdownFiles(contentDir);
  console.log(`Found ${mdFiles.length} markdown files\n`);

  let postsProcessed = 0;
  let imagesUpdated = 0;
  let imagesSkipped = 0;
  let imagesFailed = 0;

  for (const filePath of mdFiles) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Skip if no title
    if (!frontmatter.title) continue;

    // Extract image paths from content
    const imagePaths = extractImagePaths(content);

    // Also check frontmatter for images
    if (frontmatter.metadata?.media?.featuredImage) {
      imagePaths.push(frontmatter.metadata.media.featuredImage);
    }
    if (frontmatter.metadata?.media?.ogImage) {
      imagePaths.push(frontmatter.metadata.media.ogImage);
    }
    if (frontmatter.metadata?.media?.infographic) {
      imagePaths.push(frontmatter.metadata.media.infographic);
    }
    if (frontmatter.metadata?.media?.thumbnail) {
      imagePaths.push(frontmatter.metadata.media.thumbnail);
    }

    if (imagePaths.length === 0) continue;

    postsProcessed++;
    console.log(`[${postsProcessed}] ${frontmatter.title}`);
    console.log(`    Found ${imagePaths.length} images`);

    // Prepare metadata
    const postDate = frontmatter.date ? new Date(frontmatter.date) : new Date();
    const metadata: ImageMetadata = {
      title: frontmatter.title || '',
      description: frontmatter.description || '',
      author: 'Mike P. Sinn',
      copyright: `© ${postDate.getFullYear()} Mike P. Sinn`,
      keywords: frontmatter.tags || [],
      createDate: postDate,
    };

    // Update each image
    for (const imgPath of [...new Set(imagePaths)]) {
      // Convert URL path to file path
      const absoluteImgPath = path.join(contentDir, imgPath);

      try {
        // Check if file exists
        await fs.access(absoluteImgPath);

        const updated = await updateImageMetadata(absoluteImgPath, metadata);
        if (updated) {
          imagesUpdated++;
          console.log(`    [OK] ${path.basename(imgPath)}`);
        } else {
          imagesSkipped++;
          console.log(`    [SKIP] ${path.basename(imgPath)} (unsupported format)`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          imagesSkipped++;
          console.log(`    [SKIP] ${path.basename(imgPath)} (not found)`);
        } else {
          imagesFailed++;
          console.log(`    [FAIL] ${path.basename(imgPath)}: ${error.message}`);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('Summary:');
  console.log(`  Posts processed: ${postsProcessed}`);
  console.log(`  Images updated: ${imagesUpdated}`);
  console.log(`  Images skipped: ${imagesSkipped}`);
  console.log(`  Images failed: ${imagesFailed}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
