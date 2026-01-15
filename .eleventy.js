const { DateTime } = require("luxon");
const metadataValidator = require("./scripts/validate-metadata.js");

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
      .filter(item => {
        // Only include markdown files from content directory
        if (!item.inputPath ||
            !item.inputPath.includes('/content/') ||
            !item.inputPath.endsWith('.md') ||
            !item.data.title) {
          return false;
        }

        // Include items explicitly marked as posts
        if (item.data.type === 'post') {
          return true;
        }

        // Include WordPress imports (legacy)
        if (item.data.metadata && item.data.metadata.type === 'wordpress') {
          return true;
        }

        // Exclude everything else (pages, utility content, etc.)
        return false;
      })
      .sort((a, b) => {
        // Sort by composite AI score (highest first), fallback to date
        const scoreA = a.data.aiScores?.composite || 0;
        const scoreB = b.data.aiScores?.composite || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        // If scores are equal, sort by date (newest first)
        return b.date - a.date;
      });
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
