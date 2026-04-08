const EleventyFetch = require("@11ty/eleventy-fetch");

const BASE_URL = "https://manual.warondisease.org";
const SEARCH_INDEX_URL = `${BASE_URL}/assets/json/search-index.json`;
const SITES_META_URL = `${BASE_URL}/assets/json/sites-metadata.json`;

/**
 * Strip confidence intervals like "(95% CI: 4.85 years-11.5 years)" from text.
 */
function stripCI(text) {
  if (!text) return "";
  return text.replace(/\s*\(95% CI:\s*[^)]+\)/g, "");
}

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

      // URLs in search-index are missing /knowledge/ prefix
      // e.g. /problem/cost-of-war.html should be /knowledge/problem/cost-of-war.html
      const urlPath = item.url.startsWith("/knowledge/")
        ? item.url
        : "/knowledge" + item.url;
      const fullUrl = BASE_URL + urlPath;
      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      // Derive slug from URL path
      const slug = urlPath
        .replace(/\.html$/, "")
        .split("/")
        .filter(Boolean)
        .join("-");

      // Use scores from frontmatter if available, default to 5
      const scores = item.scores || {};
      const quality = scores.quality || 5;
      const value = scores.value || 5;
      const timeliness = scores.timeliness || 5;

      // Resolve image: from search-index, sites-metadata lookup, or construct from path
      let image = item.image || imageByUrl.get(fullUrl) || null;
      // Images are relative paths — prefix with base URL
      if (image && !image.startsWith("http")) {
        image = BASE_URL + image;
      }

      chapters.push({
        title: stripCI(item.title),
        description: stripCI(item.description),
        url: fullUrl,
        slug,
        tags: item.tags || [],
        sections: item.sections || [],
        lastmod: item.lastmod || null,
        image,
        source: "h2ewd",
        aiScores: { quality, value, timeliness },
      });
    }

    console.log(`[h2ewdChapters] Fetched ${chapters.length} chapters from H2EWD manual`);
    return chapters;
  } catch (err) {
    console.warn(`[h2ewdChapters] Failed to fetch H2EWD data: ${err.message}`);
    return [];
  }
};
