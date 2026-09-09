const EleventyFetch = require("@11ty/eleventy-fetch");

const PARAMS_URL = "https://manual.warondisease.org/assets/json/parameters.json";
const PARAMS_PAGE =
  "https://manual.warondisease.org/knowledge/appendix/parameters-and-calculations";

/**
 * Figures the homepage reads from the Earth Repair Manual's parameter file.
 * Live values are fetched at build time (cached for a day); the fallbacks keep
 * an offline build rendering. Each entry links to its derivation on the
 * parameters page, where the anchor is the lowercased key.
 */
const FALLBACKS = {
  MILITARY_TO_GOVERNMENT_CLINICAL_TRIALS_SPENDING_RATIO: { value: 604.4, formatted: "604:1", unit: "ratio" },
  ANNUAL_TERRORISM_DEATH_RISK_DENOMINATOR: { value: 30000000, formatted: "30 million people", unit: "people" },
  NUCLEAR_WINTER_OVERKILL_FACTOR: { value: 122.4, formatted: "122x", unit: "x" },
  RECOVERY_TRIAL_COST_PER_PATIENT: { value: 500, formatted: "$500", unit: "USD/patient" },
  TRADITIONAL_PHASE3_COST_PER_PATIENT: { value: 41000, formatted: "$41,000", unit: "USD/patient" },
  DFDA_DIRECT_FUNDING_COST_PER_DALY: { value: 0.842, formatted: "$0.842", unit: "USD/DALY" },
  TREATY_ANNUAL_FUNDING: { value: 27.2e9, formatted: "$27.2 billion", unit: "USD/year" },
  WISHONIA_PROJECTED_HALE_YEAR_15: { value: 90.1, formatted: "90.1 years", unit: "years" },
  CURRENT_TRAJECTORY_AVG_INCOME_YEAR_20: { value: 20483, formatted: "$20,483", unit: "USD" },
  TREATY_TRAJECTORY_AVG_INCOME_YEAR_20: { value: 34972, formatted: "$34,972", unit: "USD" },
};

module.exports = async function () {
  let live = {};
  try {
    const data = await EleventyFetch(PARAMS_URL, { duration: "1d", type: "json" });
    live = (data && data.parameters) || {};
    console.log(`[manualParams] Fetched ${Object.keys(live).length} parameters from the manual`);
  } catch (err) {
    console.warn(`[manualParams] Using fallback values: ${err.message}`);
  }

  const params = {};
  for (const [key, fallback] of Object.entries(FALLBACKS)) {
    const source = live[key] && typeof live[key].value === "number" ? live[key] : fallback;
    params[key] = {
      value: source.value,
      formatted: source.formatted || String(source.value),
      unit: source.unit || fallback.unit,
      url: `${PARAMS_PAGE}#sec-${key.toLowerCase()}`,
    };
  }
  return params;
};
