/**
 * Add podcast metadata to frontmatter for posts containing audio files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PodcastEpisodeMetadata {
  url: string;
  fileSize: number;
  duration: string;
  durationSeconds: number;
}

interface PodcastDataFile {
  episodes: Record<string, PodcastEpisodeMetadata>;
}

/**
 * Extract episode number from MP3 filename (e.g., tbn001 -> 1)
 */
function extractEpisodeNumber(mp3Path: string): number | null {
  const filename = path.basename(mp3Path, '.mp3');
  const match = filename.match(/tbn0*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Find MP3 URL in content (same logic as findMp3Url filter)
 */
function findMp3Url(content: string): string | null {
  if (!content) return null;

  // Pattern 1: src attribute in audio/source tags
  let match = content.match(/src="(\/wp-content\/uploads\/[^"]+\.mp3)/);
  if (match) return match[1];

  // Pattern 2: markdown link to wp-content
  match = content.match(/\]\((\/wp-content\/uploads\/[^)]+\.mp3)/);
  if (match) return match[1];

  // Pattern 3: assets/podcasts path
  match = content.match(/\]\((\/assets\/podcasts\/[^)]+\.mp3)/);
  return match ? match[1] : null;
}

/**
 * Recursively find all markdown files
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const mdFiles: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '_site', '.git', 'old-simply-static-export', 'assets'].includes(entry.name)) {
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
  const podcastDataPath = path.join(projectRoot, '11ty', '_data', 'podcastEpisodes.json');

  console.log('Adding podcast metadata to frontmatter...\n');

  // Load podcast episode data
  let podcastData: PodcastDataFile;
  try {
    const data = await fs.readFile(podcastDataPath, 'utf-8');
    podcastData = JSON.parse(data);
  } catch (error) {
    console.error('Error loading podcast data. Run "npm run podcast-data" first.');
    process.exit(1);
  }

  // Find all markdown files
  const mdFiles = await findMarkdownFiles(contentDir);
  console.log(`Found ${mdFiles.length} markdown files\n`);

  let updated = 0;
  let skipped = 0;

  for (const filePath of mdFiles) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Check if post has an MP3
    const mp3Path = findMp3Url(content);
    if (!mp3Path) {
      continue; // No podcast in this post
    }

    // Check if already has podcast frontmatter
    if (frontmatter.podcast?.audio) {
      console.log(`[SKIP] ${path.basename(filePath)} - already has podcast frontmatter`);
      skipped++;
      continue;
    }

    // Get episode metadata
    const episodeMeta = podcastData.episodes[mp3Path];
    if (!episodeMeta) {
      console.log(`[WARN] ${path.basename(filePath)} - MP3 not found in podcast data: ${mp3Path}`);
      continue;
    }

    // Extract episode number
    const episodeNumber = extractEpisodeNumber(mp3Path);

    // Build podcast frontmatter
    const podcastFrontmatter = {
      audio: mp3Path,
      duration: episodeMeta.duration,
      durationSeconds: episodeMeta.durationSeconds,
      fileSize: episodeMeta.fileSize,
      ...(episodeNumber && { episode: episodeNumber }),
      // Image will be added by generate-project-images.ts
    };

    // Update frontmatter
    frontmatter.podcast = podcastFrontmatter;

    // Write updated file
    const updatedContent = matter.stringify(content, frontmatter);
    await fs.writeFile(filePath, updatedContent, 'utf-8');

    console.log(`[OK] ${path.basename(filePath)}`);
    console.log(`     Episode ${episodeNumber || '?'}: ${episodeMeta.duration}`);
    updated++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Updated: ${updated} files`);
  console.log(`Skipped: ${skipped} files (already had podcast frontmatter)`);
  console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);
