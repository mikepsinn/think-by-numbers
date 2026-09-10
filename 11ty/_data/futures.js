const getParams = require("./manualParams.js");

/**
 * Geometry for the two-futures figure on the homepage: straight lines between
 * the manual's modeled points. Income uses a log scale so the three trajectories
 * fit on one panel. Everything here is in SVG user units.
 */
const W = 420;
const H = 230;
const M = { left: 46, right: 168, top: 16, bottom: 30 };

function panel({ title, tMax, yMin, yMax, log, ticks, series }) {
  const x = (t) => M.left + (t / tMax) * (W - M.left - M.right);
  const scale = (v) => (log ? Math.log(v) : v);
  const y = (v) =>
    M.top + (1 - (scale(v) - scale(yMin)) / (scale(yMax) - scale(yMin))) * (H - M.top - M.bottom);
  return {
    title,
    width: W,
    height: H,
    axis: { x0: x(0), x1: x(tMax), y0: y(yMin), y1: y(yMax) },
    ticks: ticks.map(([v, label]) => ({ label, y: y(v) })),
    years: [
      { label: "today", x: x(0) },
      { label: `year ${tMax}`, x: x(tMax) },
    ],
    series: series.map((s) => {
      const last = s.points[s.points.length - 1];
      return {
        name: s.name,
        kind: s.kind,
        points: s.points.map(([t, v]) => `${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(" "),
        end: { x: x(last[0]), y: y(last[1]) },
        label: s.label,
      };
    }),
  };
}

module.exports = async function () {
  const p = await getParams();
  const v = (key) => p[key].value;
  const f = (key) => p[key].formatted;

  const hale = panel({
    title: "Healthy life expectancy, years",
    tMax: 15,
    yMin: 60,
    yMax: 92,
    ticks: [[60, "60"], [70, "70"], [80, "80"], [90, "90"]],
    series: [
      {
        name: "today",
        kind: "baseline",
        label: `${f("GLOBAL_HALE_CURRENT").replace(" years", "")} · as things are`,
        points: [[0, v("GLOBAL_HALE_CURRENT")], [15, v("GLOBAL_HALE_CURRENT")]],
      },
      {
        name: "treaty",
        kind: "treaty",
        label: `${f("TREATY_PROJECTED_HALE_YEAR_15").replace(" years", "")} · with the 1% Treaty`,
        points: [[0, v("GLOBAL_HALE_CURRENT")], [15, v("TREATY_PROJECTED_HALE_YEAR_15")]],
      },
      {
        name: "wishonia",
        kind: "wishonia",
        label: `${f("WISHONIA_PROJECTED_HALE_YEAR_15").replace(" years", "")} · with the whole loop`,
        points: [[0, v("GLOBAL_HALE_CURRENT")], [15, v("WISHONIA_PROJECTED_HALE_YEAR_15")]],
      },
    ],
  });

  const income = panel({
    title: "Median income after tax, log scale",
    tMax: 20,
    yMin: 1800,
    yMax: 300000,
    log: true,
    ticks: [[2000, "$2k"], [20000, "$20k"], [200000, "$200k"]],
    series: [
      {
        name: "current",
        kind: "baseline",
        label: `${f("CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20")} · as things are`,
        points: [
          [0, v("GLOBAL_MEDIAN_AFTER_TAX_INCOME_2025")],
          [15, v("CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_15")],
          [20, v("CURRENT_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20")],
        ],
      },
      {
        name: "treaty",
        kind: "treaty",
        label: `${f("TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20")} · with the 1% Treaty`,
        points: [
          [0, v("GLOBAL_MEDIAN_AFTER_TAX_INCOME_2025")],
          [15, v("TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_15")],
          [20, v("TREATY_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20")],
        ],
      },
      {
        name: "wishonia",
        kind: "wishonia",
        label: `${f("WISHONIA_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20")} · with the whole loop`,
        points: [
          [0, v("GLOBAL_MEDIAN_AFTER_TAX_INCOME_2025")],
          [20, v("WISHONIA_TRAJECTORY_MEDIAN_AFTER_TAX_INCOME_YEAR_20")],
        ],
      },
    ],
  });

  return {
    panels: [hale, income],
    source: "https://manual.warondisease.org/knowledge/economics/gdp-trajectories.html",
  };
};
