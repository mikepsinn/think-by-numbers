const EleventyFetch = require("@11ty/eleventy-fetch");

const BASE_URL = "https://manual.warondisease.org";
const SEARCH_INDEX_URL = `${BASE_URL}/assets/json/search-index.json`;
const SITES_META_URL = `${BASE_URL}/assets/json/sites-metadata.json`;

module.exports = async function () {
  try {
    const [searchIndex, sitesMeta] = await Promise.all([
      EleventyFetch(SEARCH_INDEX_URL, { duration: "1d", type: "json" }),
      EleventyFetch(SITES_META_URL, { duration: "1d", type: "json" }),
    ]);

    // Build lookup of ogImage by URL from sites-metadata
    const imageByUrl = new Map();
    const sites = sitesMeta.sites || sitesMeta;
    for (const site of (Array.isArray(sites) ? sites : [])) {
      if (site.ogImage) {
        imageByUrl.set(site.siteUrl, site.ogImage);
      }
      for (const page of (site.pages || [])) {
        if (page.image) {
          imageByUrl.set(page.url, page.image);
        }
      }
    }

    // Normalize search-index entries
    const chapters = [];
    const seenUrls = new Set();

    for (const item of searchIndex) {
      if (!item.published || !item.title) continue;

      // Skip pages marked as non-syndicatable (utility/meta pages)
      if (item.syndicate === false) continue;

      const fullUrl = BASE_URL + item.url;
      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      // Derive slug from URL path
      const slug = item.url
        .replace(/\.html$/, "")
        .split("/")
        .filter(Boolean)
        .join("-");

      // Use scores from frontmatter if available, default to 5
      const scores = item.scores || {};
      const quality = scores.quality || 5;
      const value = scores.value || 5;
      const timeliness = scores.timeliness || 5;
      const standalone = scores.standalone || 5;
      const importance = scores.importance || 5;

      // Skip chapters that don't work well as standalone content (score < 5)
      if (standalone < 5) continue;

      chapters.push({
        title: item.title,
        description: item.description || "",
        url: fullUrl,
        slug,
        tags: item.tags || [],
        sections: item.sections || [],
        lastmod: item.lastmod || null,
        image: imageByUrl.get(fullUrl) || null,
        source: "h2ewd",
        standalone,
        aiScores: { quality, value, timeliness, importance },
      });
    }

    console.log(`[h2ewdChapters] Fetched ${chapters.length} chapters from H2EWD manual`);
    return chapters;
  } catch (err) {
    console.warn(`[h2ewdChapters] Failed to fetch H2EWD data: ${err.message}`);
    return [];
  }
};
