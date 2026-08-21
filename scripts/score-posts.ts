import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import { generateGeminiFlashContent, extractJsonFromResponse } from './lib/llm.js';

interface PostScore {
  qualityScore: number;      // 1-10: Overall quality (writing, clarity, accuracy)
  valueScore: number;         // 1-10: Educational value and importance
  timelinessScore: number;    // 1-10: Modern relevance and timeliness
  reasoning: string;          // Brief explanation of the scores
}

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function scorePost(filePath: string): Promise<PostScore> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: bodyContent } = matter(content);

  const title = data.title || 'Untitled';
  const description = data.description || '';

  // Limit content to first 2000 chars to keep token count reasonable
  const truncatedContent = bodyContent.substring(0, 2000);

  const prompt = `You score Think by Numbers posts. The site uses numbers and cost-benefit analysis to show broken systems. Voice: dark humor, incentives not sermons.

Score independently 1-10. Use the full range. Most posts are 4-7. 9-10 are rare. 1-3 are jokes, link-dumps, or empty.

quality (writing + title + evidence):
- 8-10: specific number in the title or first lines, clear mechanism, checkable sources
- 5-7: solid but Wikipedia-question title ("How much does X") or thin evidence
- 1-4: joke with no decision-relevant number, link-roundup to someone else's database, thesis-paper title, or mostly empty

value (if a million people read this, does anything get better?):
- High: misallocated trillions, preventable deaths, a lever the reader can explain
- Low: 2012 primary horse-race, Cosby jokes, "fun facts", product pitches, duplicate of another post

timeliness:
- 10: mechanism still true with current numbers (FDA, Fed, military/clinical-trial ratio)
- 7-9: evergreen principle
- 2-4: dated electoral content (Obama/Romney/Gingrich 2012) unless the mechanism is restated without the horse race

Penalize: "wealth extraction" buzzword essays with no number; catalogs of other people's tools; ALL CAPS clickbait.

Title: ${title}
Description: ${description}
Content: ${truncatedContent}

JSON:
{
  "qualityScore": <1-10>,
  "valueScore": <1-10>,
  "timelinessScore": <1-10>,
  "reasoning": "<one sentence: the number that matters, or why this is weak>"
}`;

  try {
    const response = await generateGeminiFlashContent(prompt);
    const result = extractJsonFromResponse(response, `scoring ${filePath}`) as PostScore;

    // Validate scores are in range
    if (result.qualityScore < 1 || result.qualityScore > 10 ||
        result.valueScore < 1 || result.valueScore > 10 ||
        result.timelinessScore < 1 || result.timelinessScore > 10) {
      throw new Error(`Invalid scores received: quality=${result.qualityScore}, value=${result.valueScore}, timeliness=${result.timelinessScore}`);
    }

    return result;
  } catch (error) {
    console.error(`Error scoring ${filePath}:`, error);
    // Return default scores on error
    return {
      qualityScore: 5,
      valueScore: 5,
      timelinessScore: 5,
      reasoning: 'Error occurred during scoring, using default values'
    };
  }
}

async function updatePostFrontmatter(filePath: string, scores: PostScore): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: bodyContent } = matter(content);

  // Count images (markdown ![...](...) and HTML <img>)
  const markdownImages = (bodyContent.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const htmlImages = (bodyContent.match(/<img[^>]*>/g) || []).length;
  const imageCount = markdownImages + htmlImages;

  // Calculate composite score (0-10 scale)
  // Normalize length and images to 0-10 scale
  const lengthScore = Math.min(bodyContent.length / 5000, 1) * 10;
  const imageScore = Math.min(imageCount / 5, 1) * 10;

  // Weighted average: Value=35%, Quality=25%, Timeliness=25%, Length=10%, Images=5%
  const compositeScore = (
    scores.valueScore * 0.35 +
    scores.qualityScore * 0.25 +
    scores.timelinessScore * 0.25 +
    lengthScore * 0.10 +
    imageScore * 0.05
  );

  // Update frontmatter with scores and metadata
  data.aiScores = {
    quality: scores.qualityScore,
    value: scores.valueScore,
    timeliness: scores.timelinessScore,
    composite: Math.round(compositeScore * 10) / 10, // Round to 1 decimal
    reasoning: scores.reasoning,
    scoredAt: new Date().toISOString(),
    model: 'gemini-3-flash-preview',
    length: bodyContent.length,
    imageCount: imageCount
  };

  // Rebuild the file with updated frontmatter
  const updatedContent = matter.stringify(bodyContent, data);
  await fs.writeFile(filePath, updatedContent, 'utf-8');
}

async function main() {
  const missingOnly = process.argv.includes("--missing");
  const contentDir = path.join(process.cwd(), "content");

  console.log("Finding markdown posts...");
  const files = await getAllMarkdownFiles(contentDir);

  const posts: string[] = [];
  for (const filePath of files) {
    const basename = path.basename(filePath);
    if (["README.md", "LICENSE.md", "CONTRIBUTING.md"].includes(basename)) continue;
    const raw = await fs.readFile(filePath, "utf-8");
    const { data } = matter(raw);
    const isPost =
      data.type === "post" ||
      (data.metadata && data.metadata.type === "wordpress");
    if (!isPost || !data.title) continue;
    const hasRealScore = Boolean(data.aiScores && data.aiScores.scoredAt);
    if (missingOnly && hasRealScore) continue;
    posts.push(filePath);
  }

  console.log(
    missingOnly
      ? `Scoring ${posts.length} posts with stub/missing scores (--missing)\n`
      : `Scoring ${posts.length} posts\n`
  );

  let processedCount = 0;

  for (const postPath of posts) {
    const relativePath = path.relative(contentDir, postPath);
    console.log(`\n[${processedCount + 1}/${posts.length}] Scoring: ${relativePath}`);

    try {
      const scores = await scorePost(postPath);
      await updatePostFrontmatter(postPath, scores);

      const updatedContent = await fs.readFile(postPath, "utf-8");
      const { data } = matter(updatedContent);
      const composite = data.aiScores?.composite || 0;

      console.log(`  Quality: ${scores.qualityScore}/10 | Value: ${scores.valueScore}/10 | Timeliness: ${scores.timelinessScore}/10 | Composite: ${composite}/10`);
      console.log(`  ${scores.reasoning}`);

      processedCount++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  Error processing ${relativePath}:`, error);
    }
  }

  console.log(`\nCompleted scoring ${processedCount}/${posts.length} posts`);
}

main().catch(console.error);
