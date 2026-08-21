/**
 * Print the homepage gallery top 10 for each sort dropdown option.
 *
 * Same composite formula as .eleventy.js / 11ty/index-paginated.njk.
 * Mixes local posts with How to End War and Disease chapters.
 *
 * Usage: npx tsx scripts/rank-gallery.ts
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import matter from "gray-matter";
import { glob } from "glob";

const require = createRequire(import.meta.url);
const getH2ewdChapters = require("../11ty/_data/h2ewdChapters.js") as () => Promise<
  Array<{
    title: string;
    url: string;
    lastmod?: string | null;
    aiScores?: Scores;
  }>
>;

type Scores = {
  quality?: number;
  value?: number;
  timeliness?: number;
  length?: number;
  imageCount?: number;
};

type GalleryItem = {
  title: string;
  source: "tbn" | "book";
  date: Date;
  scores: Required<Scores> & { composite: number };
};

const SORTS: Array<{ key: string; label: string }> = [
  { key: "composite", label: "Highest score" },
  { key: "value", label: "Highest value" },
  { key: "quality", label: "Highest quality" },
  { key: "timeliness", label: "Most timely" },
  { key: "date-new", label: "Newest" },
  { key: "date-old", label: "Oldest" },
];

function computeComposite(scores: Scores): number {
  const s = scores || {};
  const lengthScore = Math.min((s.length || 0) / 5000, 1) * 10;
  const imageScore = Math.min((s.imageCount || 0) / 5, 1) * 10;
  return (
    (s.value || 5) * 0.35 +
    (s.quality || 5) * 0.25 +
    (s.timeliness || 5) * 0.25 +
    lengthScore * 0.1 +
    imageScore * 0.05
  );
}

function normalizeScores(raw: Scores | undefined): GalleryItem["scores"] {
  const scores = {
    quality: raw?.quality || 5,
    value: raw?.value || 5,
    timeliness: raw?.timeliness || 5,
    length: raw?.length || 0,
    imageCount: raw?.imageCount || 0,
  };
  return { ...scores, composite: computeComposite(scores) };
}

function isBlogPost(data: matter.GrayMatterFile<string>["data"]): boolean {
  if (!data.title) return false;
  if (data.type === "post") return true;
  if (data.metadata && data.metadata.type === "wordpress") return true;
  return false;
}

async function loadLocalPosts(): Promise<GalleryItem[]> {
  const files = await glob("content/**/*.md", {
    cwd: path.join(__dirname, ".."),
    absolute: true,
    windowsPathsNoEscape: true,
  });
  const items: GalleryItem[] = [];
  for (const file of files) {
    const parsed = matter(fs.readFileSync(file, "utf8"));
    if (!isBlogPost(parsed.data)) continue;
    const date = parsed.data.date ? new Date(parsed.data.date) : new Date(0);
    items.push({
      title: String(parsed.data.title),
      source: "tbn",
      date: Number.isNaN(date.getTime()) ? new Date(0) : date,
      scores: normalizeScores(parsed.data.aiScores),
    });
  }
  return items;
}

async function loadBookChapters(): Promise<GalleryItem[]> {
  const chapters = await getH2ewdChapters();
  return (chapters || []).map((chapter) => {
    const date = chapter.lastmod ? new Date(chapter.lastmod) : new Date(0);
    return {
      title: chapter.title,
      source: "book" as const,
      date: Number.isNaN(date.getTime()) ? new Date(0) : date,
      scores: normalizeScores(chapter.aiScores),
    };
  });
}

function sortItems(items: GalleryItem[], key: string): GalleryItem[] {
  const sorted = items.slice();
  switch (key) {
    case "composite":
      sorted.sort((a, b) => b.scores.composite - a.scores.composite);
      break;
    case "value":
      sorted.sort((a, b) => b.scores.value - a.scores.value);
      break;
    case "quality":
      sorted.sort((a, b) => b.scores.quality - a.scores.quality);
      break;
    case "timeliness":
      sorted.sort((a, b) => b.scores.timeliness - a.scores.timeliness);
      break;
    case "date-new":
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      break;
    case "date-old":
      sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
      break;
  }
  return sorted;
}

function metric(item: GalleryItem, key: string): string {
  if (key === "date-new" || key === "date-old") {
    return item.date.toISOString().slice(0, 10);
  }
  if (key === "composite") return item.scores.composite.toFixed(2);
  if (key === "value") return String(item.scores.value);
  if (key === "quality") return String(item.scores.quality);
  if (key === "timeliness") return String(item.scores.timeliness);
  return "";
}

async function main() {
  const [posts, chapters] = await Promise.all([
    loadLocalPosts(),
    loadBookChapters(),
  ]);
  const gallery = [...posts, ...chapters];

  console.log("Dropdown options (homepage default is first):");
  for (const sort of SORTS) {
    console.log(`  - ${sort.label}  (${sort.key})`);
  }
  console.log(
    `\nGallery: ${posts.length} local posts + ${chapters.length} book chapters = ${gallery.length}`
  );
  console.log("Homepage first page = top 10 of Highest score.\n");

  for (const sort of SORTS) {
    console.log(`=== ${sort.label} ===`);
    const top = sortItems(gallery, sort.key).slice(0, 10);
    top.forEach((item, i) => {
      const src = item.source === "book" ? "book" : "tbn ";
      console.log(
        `  ${String(i + 1).padStart(2)}. ${metric(item, sort.key).padStart(10)}  [${src}]  ${item.title}`
      );
    });
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
