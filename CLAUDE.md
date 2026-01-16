# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Think by Numbers is a static blog built with **Eleventy 3.0** (11ty), migrated from WordPress. It's a data-driven blog about using numbers and cost-benefit analysis to make better decisions. Posts are sorted by AI-computed quality scores.

## Commands

```bash
# Development
npm start              # Clean, build, start dev server (http://localhost:8080)
npm run serve          # Start dev server only

# Build
npm run build          # Full build: clean → podcast-data → eleventy → pagefind search index

# Content automation
npm run generate-images        # Generate OG images, infographics, thumbnails (requires GOOGLE_GENERATIVE_AI_API_KEY)
npm run score-posts            # Compute AI quality scores for posts (updates frontmatter)
npm run update-image-metadata  # Update frontmatter with generated image paths
npm run podcast-data           # Generate podcast episode metadata from MP3s
npm run podcast-frontmatter    # Link podcast episodes to posts
```

## Architecture

```
.
├── 11ty/                      # Eleventy templates and data
│   ├── _data/                 # Global data (site.json, categories.js, podcastEpisodes.json)
│   ├── _includes/             # Layouts: base.njk (main), post.njk, post-card.njk
│   ├── assets/podcasts/       # Self-hosted MP3 files
│   ├── feed.njk               # Atom RSS feed
│   ├── podcast.njk            # iTunes-compatible podcast RSS
│   ├── index-paginated.njk    # Homepage with pagination
│   └── search.njk             # Pagefind search page
│
├── content/                   # All markdown content
│   ├── categories/            # Posts organized by topic (22 categories)
│   └── assets/                # Images (og-images/, infographics/, thumbnails/)
│
├── scripts/                   # TypeScript automation
│   ├── generate-project-images.ts  # AI image generation (Google Gemini)
│   ├── score-posts.ts              # AI quality scoring
│   ├── generate-podcast-data.ts    # MP3 metadata extraction
│   └── lib/                        # Shared utilities (genai-image.ts, llm.ts)
│
├── .eleventy.js               # Eleventy config (collections, filters, passthrough)
├── vercel.json                # Deployment config with 147 legacy redirects
└── _site/                     # Build output (gitignored)
```

## Key Concepts

### Collections

Posts are filtered in `.eleventy.js`:
- **posts**: Items with `type: 'post'` or WordPress metadata, sorted by `aiScores.composite` (highest first)
- **pages**: Items with `type: 'page'`, sorted alphabetically

### Frontmatter Schema

```yaml
---
title: "Article Title"
description: "Brief summary for meta tags"
date: 2025-01-15
type: post                    # or 'page'
tags: [economics, healthcare]
metadata:
  categories: [Economics]
  media:
    ogImage: /assets/og-images/economics/slug.jpg
    infographic: /assets/infographics/economics/slug.jpg
    thumbnail: /assets/thumbnails/economics/slug.jpg
aiScores:
  composite: 8.5              # Used for homepage sorting
  quality: 8
  value: 9
  timeliness: 9
podcast:
  audio: /wp-content/uploads/2024/episode.mp3
---
```

### Image Generation

`npm run generate-images` creates three image types per post using Google Gemini:
- **OG images** (1200×630) → `content/assets/og-images/[category]/`
- **Infographics** (1200×1200) → `content/assets/infographics/[category]/`
- **Thumbnails** (400×300) → `content/assets/thumbnails/[category]/`

### Search

Client-side search via Pagefind. Index is generated at build time with `npm run search` (called by `npm run build`).

## Content Guidelines

Writing style (from STYLE_GUIDE.md):
- Dark humor meets practical hope - Philomena Cunk meets Douglas Adams
- Target broken systems, not individuals
- Use "we/us/our" - include humanity as fellow participants
- Ground arguments in incentives ("What's in it for them?"), not moral appeals
- Meta descriptions: SHOCKING FACT/NUMBER + ABSURD OBSERVATION (150 chars max)

## Environment Variables

Required for content automation scripts:
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API for image generation and scoring
- `ANTHROPIC_API_KEY` - Alternative for scoring (optional)
