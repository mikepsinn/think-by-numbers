import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import mp3Duration from 'mp3-duration';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getMp3Duration = promisify(mp3Duration);

interface PodcastEpisodeMetadata {
  url: string;           // URL path to the MP3 file
  fileSize: number;      // File size in bytes
  duration: string;      // Duration in HH:MM:SS format
  durationSeconds: number; // Duration in seconds
}

interface PodcastDataFile {
  episodes: Record<string, PodcastEpisodeMetadata>;
}

/**
 * Convert seconds to HH:MM:SS format
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Recursively find all MP3 files in a directory
 */
async function findMp3Files(dir: string): Promise<string[]> {
  const mp3Files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, _site, and other build directories
        if (!['node_modules', '_site', '.git', 'old-simply-static-export'].includes(entry.name)) {
          mp3Files.push(...await findMp3Files(fullPath));
        }
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
        mp3Files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return mp3Files;
}

/**
 * Get metadata for a single MP3 file
 */
async function getMp3Metadata(filePath: string, baseDir: string): Promise<PodcastEpisodeMetadata | null> {
  try {
    // Get file stats for size
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Get duration
    let durationSeconds = 0;
    try {
      durationSeconds = await getMp3Duration(filePath) as number;
    } catch (err) {
      console.warn(`Could not get duration for ${filePath}:`, err);
    }

    // Convert file path to URL path
    const relativePath = path.relative(path.join(baseDir, 'content'), filePath);
    const urlPath = '/' + relativePath.replace(/\\/g, '/');

    return {
      url: urlPath,
      fileSize,
      duration: formatDuration(durationSeconds),
      durationSeconds: Math.round(durationSeconds)
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const contentDir = path.join(projectRoot, 'content');
  const outputPath = path.join(projectRoot, '11ty', '_data', 'podcastEpisodes.json');

  console.log('Scanning for MP3 files in:', contentDir);

  // Find all MP3 files
  const mp3Files = await findMp3Files(contentDir);
  console.log(`Found ${mp3Files.length} MP3 files`);

  // Process each file
  const episodes: Record<string, PodcastEpisodeMetadata> = {};

  for (const filePath of mp3Files) {
    console.log(`Processing: ${path.basename(filePath)}`);
    const metadata = await getMp3Metadata(filePath, projectRoot);

    if (metadata) {
      // Use URL path as key for easy lookup
      episodes[metadata.url] = metadata;
      console.log(`  Size: ${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Duration: ${metadata.duration}`);
    }
  }

  // Create output data
  const outputData: PodcastDataFile = {
    episodes
  };

  // Write to data file
  await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\nWritten podcast data to: ${outputPath}`);
  console.log(`Total episodes: ${Object.keys(episodes).length}`);
}

main().catch(console.error);
