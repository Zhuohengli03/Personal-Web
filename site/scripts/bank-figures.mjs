// Builds src/data/figures/bank.json — the aggregates behind the "Checking-account acquisition targeting"
// exhibits — from the two course files of the Fall 2026 Advanced Business Analytics midterm
// (a fictional regional bank).
//
//   node scripts/bank-figures.mjs public/work/checking-acquisition-targeting/data
//
// (both case files are published on the case page with the instructor's permission, so the exhibits
// can be rebuilt from the repo alone)
//
// campaign_history.csv  30,000 prospects mailed last year: attributes, the provided p_open score and both
//                       outcomes (opened_account, funded_90d)
// prospects_to_score.csv 25,000 new prospects: same attributes and p_open, no outcomes
//
// Only aggregates are written: deciles of the response score, the funded-balance distribution of
// openers, correlations, the nine-segment table, the two mail plans and the three hand-scored prospects.
// The funding model itself was fitted in SAS Visual Analytics; its coefficients are copied below
// (validation metrics come from the same SAS run and live in bank-text.json).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/bank-figures.mjs <csv folder>'); process.exit(1); }

const read = (name) => {
  const [head, ...rows] = readFileSync(join(dir, name), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
  const cols = head.split(',');
  return rows.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v])));
};
const num = (v) => (v === '' || v === undefined ? null : Number(v));
const r = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const hist = read('campaign_history.csv').map((d) => ({ ...d, opened: d.opened_account === 'Yes' ? 1 : 0, funded: num(d.funded_90d), p: num(d.p_open) }));
const pros = read('prospects_to_score.csv');
const N = hist.length;
const openers = hist.filter((d) => d.opened);
const openRate = openers.length / N;

// --- Finance's framework ---
const VALUE = (bal) => 0.025 * Math.max(0, bal) - 50; // value of an opened account, first year
const EV = (p, bal) => p * VALUE(bal) - 1;              // expected value of one letter
const BUDGET = 8000;

// --- 1. the provided response score, in deciles (1 = highest p_open) ---
const ranked = [...hist].sort((a, b) => b.p - a.p);
const deciles = [...Array(10).keys()].map((k) => {
  const g = ranked.slice((k * N) / 10, ((k + 1) * N) / 10);
  const rate = mean(g.map((d) => d.opened));
  return { decile: k + 1, n: g.length, p: r(mean(g.map((d) => d.p))), rate: r(rate), opened: sum(g.map((d) => d.opened)), lift: r(rate / openRate, 2) };
});

// --- 2. funded balance of the accounts that opened ---
const funded = openers.map((d) => d.funded);
const BINS = [0, 1000, 2000, 5000, 10000, 25000, 50000, Infinity];
const fundedBins = BINS.slice(0, -1).map((lo, i) => ({ lo, hi: BINS[i + 1] === Infinity ? null : BINS[i + 1], n: funded.filter((f) => f >= lo && f < BINS[i + 1]).length }));
const fundedStats = {
  n: funded.length, min: Math.min(...funded), median: r(median(funded), 0), mean: r(mean(funded), 0), max: Math.max(...funded),
  belowBreakEven: funded.filter((f) => f < 2000).length,
};

// --- 3. what moves with opening vs what moves with the funded amount (Pearson, numeric mail-date fields) ---
const pearson = (xs, ys) => {
  const pairs = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => x !== null && y !== null);
  const mx = mean(pairs.map((p) => p[0])), my = mean(pairs.map((p) => p[1]));
  const sxy = sum(pairs.map(([x, y]) => (x - mx) * (y - my)));
  const sx = Math.sqrt(sum(pairs.map(([x]) => (x - mx) ** 2))), sy = Math.sqrt(sum(pairs.map(([, y]) => (y - my) ** 2)));
  return sxy / (sx * sy);
};
const FIELDS = ['age', 'est_income_k', 'zip_median_income_k', 'years_at_residence', 'digital_engagement', 'web_visits_30d', 'mailings_12m', 'branch_distance_mi'];
const corr = FIELDS.map((f) => ({
  field: f,
  open: r(pearson(hist.map((d) => num(d[f])), hist.map((d) => d.opened)), 3),
  funded: r(pearson(openers.map((d) => num(d[f])), openers.map((d) => d.funded)), 3),
})).sort((a, b) => b.funded - a.funded);

// --- 4. the nine segments: age group × net-worth band, plus "no third-party data" ---
const BANDS = ['Under 50K', '50K-250K', '250K-1M', '1M+'];
const segOf = (d) => {
  if (d.tp_match === 'N') return 9;
  const old = num(d.age) >= 45 ? 1 : 0;
  return old * 4 + BANDS.indexOf(d.net_worth_band) + 1;
};
const segments = [...Array(9).keys()].map((k) => {
  const id = k + 1;
  const g = hist.filter((d) => segOf(d) === id);
  const o = g.filter((d) => d.opened);
  const rate = o.length / g.length;
  const avg = mean(o.map((d) => d.funded));
  return {
    id, age: id === 9 ? null : id > 4 ? '45+' : 'Under 45', band: id === 9 ? null : BANDS[(id - 1) % 4],
    records: g.length, openers: o.length, rate: r(rate), avgFunded: r(avg, 0), ev: r(EV(rate, avg), 2),
    prospects: pros.filter((d) => segOf(d) === id).length,
  };
});
const plan = (order) => {
  let left = BUDGET; const mail = [];
  for (const s of order) { if (!left) break; const n = Math.min(left, s.prospects); mail.push({ id: s.id, n, profit: r(n * s.ev, 0) }); left -= n; }
  return { mail, profit: r(sum(mail.map((m) => m.n * segments.find((s) => s.id === m.id).ev)), 0) };
};
const planA = plan([...segments].sort((a, b) => b.ev - a.ev));
const planB = plan([...segments].sort((a, b) => b.rate - a.rate));
const positive = segments.filter((s) => s.ev > 0);

// --- 5. three prospects scored by hand with the linear funding model (SAS VA estimates) ---
const B0 = -3007.69;
const NUMERIC = { age: 123.2452, est_income_k: 45.92392, years_at_residence: -79.7974, digital_engagement: -48.3029, zip_median_income_k: 27.82232, branch_distance_mi: 7.143342, web_visits_30d: 166.828, mailings_12m: 65.56553, days_since_last_contact: -0.0824 };
const CATEGORICAL = {
  net_worth_band: { '1M+': 27034.78, '250K-1M': 8292.581, '50K-250K': 1179.026 },
  homeowner: { N: -1367.7 }, recent_move: { N: 410.5058 },
  credit_band: { Excellent: 326.7425, Fair: -558.611, Good: -1418.77 },
  primary_bank_type: { 'Credit Union': 1684.522, 'National Bank': 3871.365, 'Online Bank': 1323.845, 'Regional Bank': 2602.993 },
  existing_relationship: { 'Auto Loan': -2070.08, 'Credit Card': -1422.64, Mortgage: 481.4911, 'No Product': -1031.08 },
  prior_responder: { N: 832.1791 },
};
const score = (x) => B0 + sum(Object.entries(NUMERIC).map(([k, b]) => b * x[k])) + sum(Object.entries(CATEGORICAL).map(([k, m]) => m[x[k]] ?? 0));
const trio = [
  { id: 'A', p: 0.35, age: 27, est_income_k: 48, net_worth_band: 'Under 50K', homeowner: 'N', years_at_residence: 0, recent_move: 'Y', credit_band: 'Fair', primary_bank_type: 'Online Bank', digital_engagement: 88, zip_median_income_k: 55, existing_relationship: 'No Product', mailings_12m: 1, days_since_last_contact: 200, prior_responder: 'N', branch_distance_mi: 3, web_visits_30d: 2 },
  { id: 'B', p: 0.04, age: 46, est_income_k: 95, net_worth_band: '50K-250K', homeowner: 'Y', years_at_residence: 8, recent_move: 'N', credit_band: 'Good', primary_bank_type: 'National Bank', digital_engagement: 60, zip_median_income_k: 80, existing_relationship: 'Credit Card', mailings_12m: 2, days_since_last_contact: 90, prior_responder: 'N', branch_distance_mi: 4, web_visits_30d: 1 },
  { id: 'C', p: 0.012, age: 66, est_income_k: 140, net_worth_band: '1M+', homeowner: 'Y', years_at_residence: 22, recent_move: 'N', credit_band: 'Excellent', primary_bank_type: 'National Bank', digital_engagement: 35, zip_median_income_k: 110, existing_relationship: 'Mortgage', mailings_12m: 1, days_since_last_contact: 400, prior_responder: 'N', branch_distance_mi: 6, web_visits_30d: 0 },
].map((x) => { const raw = score(x); return { id: x.id, p: x.p, age: x.age, income: x.est_income_k, band: x.net_worth_band, digital: x.digital_engagement, raw: r(raw, 0), balance: r(Math.max(0, raw), 0), ev: r(EV(x.p, raw), 2) }; });
const byP = [...trio].sort((a, b) => b.p - a.p).map((x) => x.id), byEV = [...trio].sort((a, b) => b.ev - a.ev).map((x) => x.id);
trio.forEach((x) => { x.rankP = byP.indexOf(x.id) + 1; x.rankEV = byEV.indexOf(x.id) + 1; });

const out = {
  totals: {
    history: N, opened: openers.length, openRate: r(openRate), prospects: pros.length, budget: BUDGET,
    noThirdParty: hist.filter((d) => d.tp_match === 'N').length, neverContacted: hist.filter((d) => num(d.days_since_last_contact) === 999).length,
  },
  deciles, funded: { ...fundedStats, bins: fundedBins }, corr, segments,
  plans: { A: planA, B: planB, positiveProspects: sum(positive.map((s) => s.prospects)) },
  trio,
};
writeFileSync(new URL('../src/data/figures/bank.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ totals: out.totals, funded: fundedStats, plans: { A: planA.profit, B: planB.profit, positive: out.plans.positiveProspects } }, null, 1));
console.table(deciles); console.table(corr); console.table(segments); console.table(planA.mail); console.table(planB.mail); console.table(trio);
