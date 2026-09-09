/**
 * Projects listed on the homepage, grouped by what each one does.
 *
 * `figure` is the number shown at the end of each contents line. To pull a
 * figure live from the manual instead, set `figureParam` to a key from
 * manualParams.js (plus an optional `figureSuffix`). `figureKind: "postCount"`
 * shows the number of published articles.
 */
module.exports = {
  groups: [
    {
      verb: "Measure",
      tagline: "Find out what actually works.",
      items: [
        {
          name: "Optimitron",
          url: "https://optimitron.com/",
          figure: "10,000 jurisdictions",
          description:
            "Open-source causal inference over the policy differences between jurisdictions, to learn which policies improve outcomes rather than which ones sound nice.",
        },
        {
          name: "Decentralized FDA",
          url: "https://dfda.earth/",
          figure: "50,000+ studies",
          description:
            "Pools health data and publishes reproducible evidence about what helps, at trial costs closer to $500 than $41,000.",
        },
      ],
    },
    {
      verb: "Decide",
      tagline: "Allocate without the shouting.",
      items: [
        {
          name: "Wishocracy",
          url: "https://wishocracy.warondisease.org/",
          figure: "2 options at a time",
          description:
            "Turns a budget into pairwise comparisons anyone can answer, then aggregates the answers into a plan. No lobbyist required.",
        },
        {
          name: "Optimocracy",
          url: "https://manual.warondisease.org/knowledge/solution/optimocracy.html",
          figure: "3 steps",
          description:
            "The paper. Recommend what the evidence supports, track who votes with it, reward the ones who do. Corruption becomes impractical rather than merely illegal.",
        },
      ],
    },
    {
      verb: "Fund",
      tagline: "Move one percent of the money.",
      items: [
        {
          name: "The 1% Treaty",
          url: "https://warondisease.org/",
          figure: "1%",
          description:
            "A global survey and treaty proposal to redirect one percent of military spending to curing disease. You can vote on it now.",
        },
        {
          name: "Decentralized Institutes of Health",
          url: "https://dih.earth/",
          figureParam: "TREATY_ANNUAL_FUNDING",
          figureSuffix: " a year",
          figure: "$27 billion a year",
          description:
            "The hub that would receive that one percent and route it to trials, data, and cures.",
        },
        {
          name: "CureDAO",
          url: "https://curedao.org/",
          figure: "open source",
          description:
            "Community-owned clinical research, so the incentives point at patients.",
        },
      ],
    },
    {
      verb: "Explain",
      tagline: "Show the work.",
      items: [
        {
          name: "How to End War and Disease",
          url: "https://manual.warondisease.org/",
          figure: "free online",
          description:
            "The Earth Repair Manual, translated from the original alien. Also in paperback, Kindle, and audiobook.",
        },
        {
          name: "Think by Numbers",
          url: "/posts/",
          figureKind: "postCount",
          figure: "120+ articles",
          description:
            "The articles. More than a decade of lining numbers up next to each other and reporting what happened.",
        },
        {
          name: "The podcast",
          url: "https://open.spotify.com/show/1aX8mw9MmFzyiSBq2RNnu2",
          figure: "Spotify · Apple",
          description:
            "The manual, read aloud, for people who prefer their arithmetic while walking.",
        },
      ],
    },
  ],
  also: [
    { name: "Wishonia", url: "https://wishonia.love/", note: "where AI agents work the same task list" },
    { name: "The Plutonium Kidz", url: "https://plutoniumkidz.mikesinn.com/", note: "which is a band" },
  ],
};
