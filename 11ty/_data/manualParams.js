const EleventyFetch = require("@11ty/eleventy-fetch");

const PARAMS_URL = "https://manual.warondisease.org/assets/json/parameters.json";
const PARAMS_PAGE =
  "https://manual.warondisease.org/knowledge/appendix/parameters-and-calculations.html";

/**
 * Figures the homepage reads from the Earth Repair Manual's parameter file.
 * Live values are fetched at build time (cached for a day); the fallbacks keep
 * an offline build rendering. Every entry carries a link to its calculation,
 * where the derivation and its uncertainty are shown.
 */
const FALLBACKS = {
  // The bill
  POLITICAL_DYSFUNCTION_TAX_PER_PERSON_ANNUAL: { value: 12625, formatted: "$12,625", unit: "USD/year" },
  POLITICAL_DYSFUNCTION_TAX_PER_HOUSEHOLD_OF_FOUR_ANNUAL: { value: 50500, formatted: "$50,500", unit: "USD/year" },
  // Outcomes, today and modeled
  GLOBAL_HALE_CURRENT: { value: 63.3, formatted: "63.3 years", unit: "years" },
  TREATY_PROJECTED_HALE_YEAR_15: { value: 79.4, formatted: "79.4 years", unit: "years" },
  WISHONIA_PROJECTED_HALE_YEAR_15: { value: 90.1, formatted: "90.1 years", unit: "years" },
  GLOBAL_MEDIAN_AFTER_TAX_INCOME_2025: { value: 2138, formatted: "$2,138", unit: "USD/year" },
  CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_15: { value: 2774, formatted: "$2,774", unit: "USD/year" },
  CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20: { value: 3033, formatted: "$3,033", unit: "USD/year" },
  TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_15: { value: 4381, formatted: "$4,381", unit: "USD/year" },
  TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20: { value: 5736, formatted: "$5,736", unit: "USD/year" },
  WISHONIA_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20: { value: 194130, formatted: "$194,130", unit: "USD/year" },
  NEW_DISEASE_FIRST_TREATMENTS_PER_YEAR: { value: 15, formatted: "15 diseases/year", unit: "diseases/year" },
  DFDA_FIRST_TREATMENTS_PER_YEAR: { value: 185, formatted: "185 diseases/year", unit: "diseases/year" },
  STATUS_QUO_QUEUE_CLEARANCE_YEARS: { value: 443, formatted: "443 years", unit: "years" },
  DFDA_QUEUE_CLEARANCE_YEARS: { value: 36, formatted: "36 years", unit: "years" },
  // Mechanism
  TRADITIONAL_PHASE3_COST_PER_PATIENT: { value: 41000, formatted: "$41,000", unit: "USD/patient", confidenceInterval: [20000, 120000] },
  RECOVERY_TRIAL_COST_PER_PATIENT: { value: 500, formatted: "$500", unit: "USD/patient", confidenceInterval: [400, 2500] },
  GLOBAL_GOVERNMENT_CLINICAL_TRIALS_SPENDING_ANNUAL: { value: 4.5e9, formatted: "$4.5 billion", unit: "USD/year" },
  TREATY_ANNUAL_FUNDING: { value: 27.2e9, formatted: "$27.2 billion", unit: "USD/year" },
};

function formatBound(n, unit) {
  const num = Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
  return unit && unit.startsWith("USD") ? `$${num}` : num;
}

/** Short display form: "185 diseases/year" becomes "185", "63.3 years" stays. */
function shortForm(formatted) {
  return String(formatted)
    .replace(/\s+(diseases|deaths)\/year$/, "")
    .replace(/\s+people$/, "");
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
    const formatted = source.formatted || String(source.value);
    params[key] = {
      value: source.value,
      formatted,
      short: shortForm(formatted),
      unit,
      url: source.calculationUrl || `${PARAMS_PAGE}#sec-${key.toLowerCase()}`,
      ci,
      ciText: ci ? `${formatBound(ci[0], unit)} to ${formatBound(ci[1], unit)}` : "",
    };
  }

  // Government trial funding with the treaty's contribution added, in billions.
  const trialsNow = params.GLOBAL_GOVERNMENT_CLINICAL_TRIALS_SPENDING_ANNUAL.value;
  const withTreaty = trialsNow + params.TREATY_ANNUAL_FUNDING.value;
  params.TRIAL_FUNDING_WITH_TREATY = {
    value: withTreaty,
    formatted: `$${(withTreaty / 1e9).toLocaleString("en-US", { maximumFractionDigits: 1 })} billion`,
    short: `$${(withTreaty / 1e9).toLocaleString("en-US", { maximumFractionDigits: 1 })} billion`,
    unit: "USD/year",
    url: params.TREATY_ANNUAL_FUNDING.url,
    ci: null,
    ciText: "",
  };

  return params;
};
