const EleventyFetch = require("@11ty/eleventy-fetch");

const PARAMS_URL = "https://manual.warondisease.org/assets/json/parameters.json";
const PARAMS_PAGE =
  "https://manual.warondisease.org/knowledge/appendix/parameters-and-calculations.html";

/**
 * Figures the homepage reads from the Earth Repair Manual's parameter file.
 * Live values are fetched at build time (cached for a day); the fallbacks keep
 * an offline build rendering. Every entry carries a link to its calculation,
 * where the manual shows the derivation and its uncertainty.
 */
const FALLBACKS = {
  POLITICAL_DYSFUNCTION_TAX_PER_PERSON_ANNUAL: { value: 12625, formatted: "$12,625", unit: "USD/year" },
  POLITICAL_DYSFUNCTION_TAX_PER_HOUSEHOLD_OF_FOUR_ANNUAL: { value: 50500, formatted: "$50,500", unit: "USD/year" },
  WISHONIA_TRAJECTORY_LIFETIME_INCOME_GAIN_PER_CAPITA: { value: 36.4e6, formatted: "$36.4 million", unit: "USD" },
  GLOBAL_ANNUAL_DEATHS_CURABLE_DISEASES: { value: 55e6, formatted: "55 million deaths/year", unit: "deaths/year" },
  MILITARY_TO_GOVERNMENT_CLINICAL_TRIALS_SPENDING_RATIO: { value: 604.4, formatted: "604:1", unit: "ratio" },
  RECOVERY_TRIAL_COST_PER_PATIENT: { value: 500, formatted: "$500", unit: "USD/patient", confidenceInterval: [400, 2500] },
  TRADITIONAL_PHASE3_COST_PER_PATIENT: { value: 41000, formatted: "$41,000", unit: "USD/patient", confidenceInterval: [20000, 120000] },
  TREATY_ANNUAL_FUNDING: { value: 27.2e9, formatted: "$27.2 billion", unit: "USD/year" },
  GLOBAL_HALE_CURRENT: { value: 63.3, formatted: "63.3 years", unit: "years" },
  TREATY_PROJECTED_HALE_YEAR_15: { value: 79.4, formatted: "79.4 years", unit: "years" },
  WISHONIA_PROJECTED_HALE_YEAR_15: { value: 90.1, formatted: "90.1 years", unit: "years" },
  GLOBAL_MEDIAN_AFTER_TAX_INCOME_2025: { value: 2138, formatted: "$2,138", unit: "USD/year" },
  CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_15: { value: 2774, formatted: "$2,774", unit: "USD/year" },
  CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20: { value: 3033, formatted: "$3,033", unit: "USD/year" },
  TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_15: { value: 4381, formatted: "$4,381", unit: "USD/year" },
  TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20: { value: 5736, formatted: "$5,736", unit: "USD/year" },
  WISHONIA_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20: { value: 194130, formatted: "$194,130", unit: "USD/year" },
};

function formatBound(n, unit) {
  const num = Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
  return unit && unit.startsWith("USD") ? `$${num}` : num;
}

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
    const unit = source.unit || fallback.unit || "";
    const ci = Array.isArray(source.confidenceInterval) && source.confidenceInterval.length === 2
      ? source.confidenceInterval
      : null;
    params[key] = {
      value: source.value,
      formatted: source.formatted || String(source.value),
      unit,
      url: source.calculationUrl || `${PARAMS_PAGE}#sec-${key.toLowerCase()}`,
      ci,
      ciText: ci ? `${formatBound(ci[0], unit)} to ${formatBound(ci[1], unit)}` : "",
    };
  }
  return params;
};
