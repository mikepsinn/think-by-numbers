---
title: 'Felicific Calculus: Formula, Morality Calculator & Example'
description: >-
  In 1789, Bentham reduced all morality to 7 variables. Slide them in our
  morality calculator. Killing your cat still scores negative.
authors: []
date: 2012-11-26T03:50:41.000Z
metadata:
  featuredImage: 'https://thinkbynumbers.org/wp-content/uploads/2012/11/felicific-calculus.jpg'
  media:
    featuredImage: /wp-content/uploads/2012/11/felicific-calculus.jpg
    ogImage: /assets/og-images/empiricism-2/felicific-calculus.jpg
    infographic: /assets/infographics/empiricism-2/felicific-calculus.jpg
    thumbnail: /assets/thumbnails/empiricism-2/felicific-calculus.jpg
  categories:
    - Empiricism
    - Utilitarianism
  tags:
    - economics
    - felicific calculus
    - utilitarianism
  uuid: '11ty/import::wordpress::http://crowdsourcingutopia.com/?p=53'
  type: wordpress
  url: 'https://thinkbynumbers.org/empiricism-2/felicific-calculus/'
tags:
  - empiricism
  - utilitarianism
aiScores:
  quality: 5
  value: 6
  timeliness: 9
  reasoning: >-
    While the content is a foundational explanation of Utilitarianism, the text
    cuts off mid-sentence, reducing its immediate utility. However, this matters
    NOW because modern policy—from AI alignment to healthcare rationing
    (QALYs)—is built on these exact variables. By mastering the 'calculator,'
    citizens can expose when 'The Greater Good' is being used as a mathematical
    front for wealth extraction or the marginalization of the median individual.
  scoredAt: '2025-12-31T06:00:40.828Z'
  model: gemini-3-flash-preview
  length: 3072
  imageCount: 0
---
The **felicific calculus** is an algorithm for calculating the degree or amount of [pleasure](https://en.wikipedia.org/wiki/Pleasure) that a specific action is likely to cause. The algorithm is also known as the utility calculus, the hedonistic calculus, and the hedonic calculus.

Here’s a work-in-progress [spreadsheet](https://docs.google.com/spreadsheets/d/1JAF7deRc-3jK5xzCRJPRJE3k88oXZRGYqoMWzFFuPL0/edit#gid=0) to do the calculation. (Feel free to make improvements!)

## Morality Calculator

<div id="calculator" class="fc-calc">
<style>
.fc-calc { border: 1px solid var(--color-text-light, #666); background: var(--color-paper, #fafafa); padding: 1.25rem; margin: 1.5rem 0; }
.fc-calc fieldset { border: 0; margin: 0; padding: 0; }
.fc-calc legend { font-weight: 600; font-size: 1.1em; padding: 0; }
.fc-note { font-size: .9em; color: var(--color-text-light, #666); margin: .25rem 0 .75rem; }
.fc-row { display: grid; grid-template-columns: minmax(12rem, 1fr) minmax(8rem, 2fr) 3rem; gap: .6rem; align-items: center; margin: .45rem 0; }
@media (max-width: 540px) { .fc-row { grid-template-columns: 1fr 3rem; } .fc-row label { grid-column: 1 / -1; } }
.fc-calc label { font-size: .9em; line-height: 1.3; }
.fc-calc input[type="range"] { width: 100%; margin: 0; accent-color: var(--color-accent, #000); }
.fc-calc output { font-variant-numeric: tabular-nums; text-align: right; font-size: .9em; }
.fc-result { margin-top: 1rem; padding-top: .75rem; border-top: 1px solid var(--color-text-light, #666); }
.fc-score { font-size: 1.35em; font-weight: 600; margin: 0; }
.fc-verdict { margin: .3rem 0 0; font-style: italic; }
.fc-formula { font-size: .8em; color: var(--color-text-light, #666); margin: .6rem 0 0; }
</style>
<fieldset>
<legend>Morality Calculator</legend>
<p class="fc-note">Rate any act on Bentham’s seven variables (1789). The verdict updates as you slide.</p>
<div class="fc-row"><label for="fc-intensity">Intensity — how strong? (−10 agony to +10 bliss)</label><input type="range" id="fc-intensity" min="-10" max="10" step="1" value="5"><output id="fc-intensity-out" for="fc-intensity">5</output></div>
<div class="fc-row"><label for="fc-duration">Duration — how long? (0 fleeting to 10 lifelong)</label><input type="range" id="fc-duration" min="0" max="10" step="1" value="5"><output id="fc-duration-out" for="fc-duration">5</output></div>
<div class="fc-row"><label for="fc-certainty">Certainty — how likely? (0 no chance to 10 guaranteed)</label><input type="range" id="fc-certainty" min="0" max="10" step="1" value="8"><output id="fc-certainty-out" for="fc-certainty">8</output></div>
<div class="fc-row"><label for="fc-propinquity">Propinquity — how soon? (0 someday to 10 right now)</label><input type="range" id="fc-propinquity" min="0" max="10" step="1" value="8"><output id="fc-propinquity-out" for="fc-propinquity">8</output></div>
<div class="fc-row"><label for="fc-fecundity">Fecundity — breeds more of the same? (0 to 10)</label><input type="range" id="fc-fecundity" min="0" max="10" step="1" value="3"><output id="fc-fecundity-out" for="fc-fecundity">3</output></div>
<div class="fc-row"><label for="fc-purity">Purity — chance of no painful aftertaste (0 to 10)</label><input type="range" id="fc-purity" min="0" max="10" step="1" value="7"><output id="fc-purity-out" for="fc-purity">7</output></div>
<div class="fc-row"><label for="fc-extent">Extent — people affected (1 to 100)</label><input type="range" id="fc-extent" min="1" max="100" step="1" value="1"><output id="fc-extent-out" for="fc-extent">1</output></div>
</fieldset>
<div class="fc-result">
<p class="fc-score">Net score: <span id="fc-total">0</span> hedons</p>
<p class="fc-verdict" id="fc-verdict" aria-live="polite"></p>
<p class="fc-formula">Felicific calculus formula used: intensity × duration × certainty × propinquity × (1 + fecundity − impurity) × extent, with duration, certainty, propinquity, fecundity, and impurity each scaled to 0–1 (impurity = 1 − purity/10).</p>
</div>
<script>
(function () {
  var ids = ["intensity", "duration", "certainty", "propinquity", "fecundity", "purity", "extent"];
  var el = {};
  for (var i = 0; i < ids.length; i++) { el[ids[i]] = document.getElementById("fc-" + ids[i]); }
  var total = document.getElementById("fc-total");
  var verdict = document.getElementById("fc-verdict");
  function v(name) { return parseFloat(el[name].value); }
  function judge(n) {
    if (n >= 1000) return "Saintly. Bentham’s preserved corpse smiles from its glass case at UCL.";
    if (n >= 100) return "Proceed. Net pleasure detected. A rare event in human decision-making.";
    if (n > 0) return "Marginally moral. You’ve cleared the lowest bar in ethics: better than nothing.";
    if (n === 0) return "Perfectly neutral. The universe remains indifferent, as is tradition.";
    if (n > -100) return "Suboptimal. Reconsider, or run for office.";
    if (n > -1000) return "Net evil. Most of recorded history keeps you company.";
    return "Atrocity-grade. Historically popular; still not recommended.";
  }
  function update() {
    for (var i = 0; i < ids.length; i++) {
      var out = document.getElementById("fc-" + ids[i] + "-out");
      if (out) { out.value = el[ids[i]].value; }
    }
    var base = v("intensity") * (v("duration") / 10) * (v("certainty") / 10) * (v("propinquity") / 10);
    var net = Math.round(base * (1 + v("fecundity") / 10 - (10 - v("purity")) / 10) * v("extent"));
    total.textContent = (net > 0 ? "+" : "") + net;
    verdict.textContent = judge(net);
  }
  for (var i = 0; i < ids.length; i++) { el[ids[i]].addEventListener("input", update); }
  update();
})();
</script>
</div>

## Hedonic Calculus, Hedonistic Calculus: Same Bentham, Different Name

Felicific calculus, hedonic calculus, hedonistic calculus, utility calculus, and moral calculus are five names for the same seven-variable algorithm Jeremy Bentham published in _An Introduction to the Principles of Morals and Legislation_ (1789). “Felicific” is just Latin for “happiness-making,” which philosophers prefer because “hedonistic calculus” sounds like math you’d do at a casino. Whatever you call it, the procedure is identical: score the seven variables above, sum the pleasures, subtract the pains.

## Units of Pleasure and Pain

The units of measurements used in the felicific calculus are:

-   **Negend** (aka dolor) – Unit of pain. Derived from the “negative end result”
-   **Posend** (aka hedon) – Unit of pleasure. Derived from the “positive end result”

## Variable Definitions

Variables of the pleasures and pains included in this calculation are:

1.  Intensity: How strong is the pleasure?
2.  [Duration](https://en.wikipedia.org/wiki/Time): How long will the pleasure last?
3.  [Certainty](https://en.wikipedia.org/wiki/Certainty) or [uncertainty](https://en.wikipedia.org/wiki/Uncertainty): How likely or unlikely is it that the pleasure will occur?
4.  [Propinquity](https://en.wikipedia.org/wiki/Propinquity) or remoteness: How soon will the pleasure happen?
5.  [Fecundity](https://en.wikipedia.org/wiki/Fecundity): The probability that the action will produce other pleasures.
6.  [Purity](https://en.wiktionary.org/wiki/Purity): The likelihood that the action won’t cause pain.
7.  [Extent](https://en.wiktionary.org/wiki/extent): How many people will be affected?

## Instructions for Calculating Net Harm/Benefit of an Action

1.  Consider a conscious being most immediately to be affected by an action. Rate the following for this being on a scale of 1 to 10:
    -   each different pleasure that appears to be produced by it in the first instance
    -   each pain that seems to be produced by it in the first instance
    -   each pleasure that appears to be produced after the first. The sum constitutes the fecundity of the first pleasure and the impurity of the first pain.
    -   each pain produced by it after the first. The sum constitutes the fecundity of the first pain and the impurity of the first pleasure.
2.  Repeat the process for each conscious being impacted.
3.  Sum the posends for everyone and subtract the negends for everyone.
4.  The act is a net good for the community if the total exceeds 0 (i.e., posends exceeded negends). It’s a net evil if the result is below 0.

### Worked Example: Eating Your Roommate’s Leftover Pizza

-   Your pleasure: cold pizza at 2 a.m., intensity 8, certain and immediate — **+8 posends**
-   Your impurity: guilt, plus a passive-aggressive sticky note tomorrow — **−3 negends**
-   Roommate’s pain: discovering the empty box (7), plus eroded trust breeding future pains (2) — **−9 negends**
-   Net total: 8 − 12 = **−4 hedons**. Verdict: net evil. Buy your own pizza.

## References

1.  [Ethical calculus](https://en.wikipedia.org/wiki/Ethical_calculus)
2.  [Science of morality](https://en.wikipedia.org/wiki/Science_of_morality)
3.  Jeremy Bentham, [_An Introduction to the Principles of Morals and Legislation_](http://www.econlib.org/library/Bentham/bnthPML.html), London, 1789, [chap. 4](http://www.econlib.org/library/Bentham/bnthPML4.html)
4.  [Spreadsheet Calculator](https://docs.google.com/spreadsheets/d/1JAF7deRc-3jK5xzCRJPRJE3k88oXZRGYqoMWzFFuPL0/edit#gid=0) (Feel free to make improvements!)
