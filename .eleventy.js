const { DateTime } = require("luxon");
const metadataValidator = require("./scripts/validate-metadata.js");
const getH2ewdChapters = require("./11ty/_data/h2ewdChapters.js");
const homepageOrder = require("./11ty/_data/homepageOrder.js");

// Composite score recomputed from score parts. Must stay identical to the
// client-side calculateComposite() in 11ty/index-paginated.njk and the
// or-5/or-0 defaults in 11ty/posts-index.njk, so the server-rendered order
// matches the client's composite sort (most posts lack a frontmatter
// composite, so sorting by the stored value would fall back to date order).
function computeCompositeScore(scores) {
  const s = scores || {};
  const lengthScore = Math.min((s.length || 0) / 5000, 1) * 10;
  const imageScore = Math.min((s.imageCount || 0) / 5, 1) * 10;
  return (
    (s.value || 5) * 0.35 +
    (s.quality || 5) * 0.25 +
    (s.timeliness || 5) * 0.25 +
    lengthScore * 0.10 +
    imageScore * 0.05
  );
}

module.exports = function(eleventyConfig) {
  // Load metadata validation plugin
  eleventyConfig.addPlugin(metadataValidator);

  // Copy assets to output (strip /content/ prefix)
  eleventyConfig.addPassthroughCopy({ "content/assets": "assets" });
  eleventyConfig.addPassthroughCopy("content/**/assets");
  // Preserve WordPress uploads for SEO (strip /content/ prefix)
  eleventyConfig.addPassthroughCopy({ "content/wp-content": "wp-content" });
  // Copy redirects file for Netlify/Vercel
  eleventyConfig.addPassthroughCopy("_redirects");

  // Date filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("MMMM d, yyyy");
  });

  eleventyConfig.addFilter("dateToISO", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  eleventyConfig.addFilter("dateTimestamp", (dateStr) => {
    if (!dateStr) return Date.now();
    // Guard against unparseable date strings: NaN inside posts-index.json
    // would make the whole file invalid JSON and disable client-side sorting.
    const timestamp = new Date(dateStr).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  });

  eleventyConfig.addFilter("dateToRfc822", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toRFC2822();
  });

  // Get newest collection item date
  eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
    if (!collection || !collection.length) {
      return new Date();
    }
    return new Date(Math.max(...collection.map(item => item.date)));
  });

  // Limit filter
  eleventyConfig.addFilter("limit", (array, limit) => {
    return array.slice(0, limit);
  });

  function isBlogPost(item) {
    if (!item.inputPath ||
        !(item.inputPath.includes("/content/") || item.inputPath.includes("\\content\\")) ||
        !item.inputPath.endsWith(".md") ||
        !item.data.title) {
      return false;
    }
    if (item.data.type === "post") return true;
    if (item.data.metadata && item.data.metadata.type === "wordpress") return true;
    return false;
  }

  function sortByCompositeThenDate(a, b) {
    const scoreA = computeCompositeScore(a.data.aiScores);
    const scoreB = computeCompositeScore(b.data.aiScores);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.date || 0) - (a.date || 0);
  }

  function postFileKey(item) {
    const p = String(item.inputPath || "").replace(/\\/g, "/");
    const marker = "/content/";
    const idx = p.toLowerCase().lastIndexOf(marker);
    return idx === -1 ? "" : p.slice(idx + marker.length);
  }

  function galleryOrderIndex(item) {
    const listed = homepageOrder;
    if (item.data && item.data.external) {
      const title = String(item.data.title || "").toLowerCase();
      const i = listed.findIndex((key) => {
        if (!key.startsWith("book:")) return false;
        const needle = key.slice(5).toLowerCase();
        return title === needle || title.startsWith(needle);
      });
      return i === -1 ? 5000 : i;
    }
    const file = postFileKey(item);
    const i = listed.indexOf(file);
    return i === -1 ? 6000 : i;
  }

  function sortGallery(a, b) {
    const ra = galleryOrderIndex(a);
    const rb = galleryOrderIndex(b);
    if (ra !== rb) return ra - rb;
    const qa = (a.data.aiScores && a.data.aiScores.quality) || 0;
    const qb = (b.data.aiScores && b.data.aiScores.quality) || 0;
    if (qb !== qa) return qb - qa;
    return (b.date || 0) - (a.date || 0);
  }

  function chapterToGalleryItem(chapter) {
    const scores = chapter.aiScores || {};
    const composite = Math.round(computeCompositeScore(scores) * 10) / 10;
    return {
      url: chapter.url,
      date: chapter.lastmod ? new Date(chapter.lastmod) : new Date(0),
      data: {
        title: chapter.title,
        description: chapter.description,
        external: true,
        metadata: { media: { card: chapter.image, ogImage: chapter.image } },
        aiScores: { ...scores, composite },
      },
    };
  }

  // Decode HTML entities
  eleventyConfig.addFilter("decodeHtml", (str) => {
    if (!str) return str;
    const entities = {
      '&#8217;': "'", '&#8216;': "'", '&#8220;': '"', '&#8221;': '"',
      '&#8230;': '...', '&#x2122;': '™', '&#038;': '&', '&amp;': '&',
      '&#8211;': '–', '&#8212;': '—', '&quot;': '"', '&#039;': "'",
      '&lt;': '<', '&gt;': '>'
    };
    // Replace both numeric (&#8217;) and named (&amp;) entities
    return str.replace(/&#?[\w\d]+;/g, match => entities[match] || match);
  });

  // Escape HTML
  eleventyConfig.addFilter("escape", (str) => {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  });

  // Convert relative URLs to absolute
  eleventyConfig.addFilter("htmlToAbsoluteUrls", (htmlContent, baseUrl) => {
    if (!htmlContent) return htmlContent;
    return htmlContent
      .replace(/href="\//g, `href="${baseUrl}/`)
      .replace(/src="\//g, `src="${baseUrl}/`);
  });

  // Find MP3 URL in content (checks multiple patterns from WordPress/Blubrry migration)
  eleventyConfig.addFilter("findMp3Url", (content) => {
    if (!content) return null;
    // Pattern 1: src attribute in audio/source tags
    let match = content.match(/src="(\/wp-content\/uploads\/[^"]+\.mp3)/);
    if (match) return match[1];
    // Pattern 2: markdown link to wp-content
    match = content.match(/\]\((\/wp-content\/uploads\/[^)]+\.mp3)/);
    if (match) return match[1];
    // Pattern 3: assets/podcasts path (future use)
    match = content.match(/\]\((\/assets\/podcasts\/[^)]+\.mp3)/);
    return match ? match[1] : null;
  });

  // Extract excerpt from content
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    // Decode HTML entities first
    const entities = {
      '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'",
      '&nbsp;': ' ', '&#8217;': "'", '&#8216;': "'", '&#8220;': '"',
      '&#8221;': '"', '&#8211;': '–', '&#8212;': '—'
    };
    let decoded = content.replace(/&[#\w]+;/g, match => entities[match] || '');

    // Strip HTML tags and get plain text
    let excerpt = decoded
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Truncate to ~150 characters at word boundary
    if (excerpt.length > 150) {
      excerpt = excerpt.substring(0, 150);
      excerpt = excerpt.substring(0, excerpt.lastIndexOf(' ')) + '...';
    }
    return excerpt;
  });

  // URL encode filter for sharing URLs
  eleventyConfig.addFilter("urlencode", (str) => {
    if (!str) return "";
    return encodeURIComponent(str);
  });

  // Get all unique tags from collections
  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set();
    collection.forEach(item => {
      if (item.data.tags) {
        item.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  });

  // Slugify filter for URLs
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return str
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  });

  // WordPress-style posts collection (blog articles that appear in feeds/listings)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getAll()
      .filter(isBlogPost)
      .sort(sortByCompositeThenDate);
  });

  // Homepage gallery: curated order, then remaining book chapters, then other posts.
  eleventyConfig.addCollection("gallery", async function(collectionApi) {
    const posts = collectionApi.getAll().filter((item) => {
      if (!isBlogPost(item)) return false;
      const p = String(item.inputPath || "").replace(/\\/g, "/");
      return !p.includes("/monkey-business/");
    });
    const chapters = await getH2ewdChapters();
    return [...posts, ...chapters.map(chapterToGalleryItem)]
      .sort(sortGallery);
  });

  // WordPress-style pages collection (standalone pages that don't appear in feeds)
  eleventyConfig.addCollection("pages", function(collectionApi) {
    return collectionApi.getAll()
      .filter(item => {
        // Only include markdown files from content directory
        if (!item.inputPath ||
            !item.inputPath.includes('/content/') ||
            !item.inputPath.endsWith('.md') ||
            !item.data.title) {
          return false;
        }

        // Include items explicitly marked as pages
        if (item.data.type === 'page') {
          return true;
        }

        // Include legacy page metadata
        if (item.data.metadata && item.data.metadata.type === 'page') {
          return true;
        }

        return false;
      })
      .sort((a, b) => {
        // Sort by title alphabetically
        return (a.data.title || '').localeCompare(b.data.title || '');
      });
  });

  // Set input and output directories
  return {
    dir: {
      input: ".",  // Root directory (includes both 11ty and content)
      output: "_site",
      includes: "11ty/_includes",  // Includes are in 11ty folder
      data: "11ty/_data"  // Data files are in 11ty folder
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"]
  };
};
