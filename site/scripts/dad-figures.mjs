#!/usr/bin/env node
// Builds src/data/figures/dad.json from the DaD Market Forecast project's raw collection (not committed):
//   node scripts/dad-figures.mjs [path/to/gold_ore.csv]
// Output: hourly median price, daily 25–75% band, the 80/20 split time, plus the forecast table and model
// scores transcribed from the pipeline's run output (see the case-study screenshots).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const csvPath = process.argv[2] ?? resolve(process.env.HOME ?? '', 'Cursor/Darker Market/gold_ore.csv');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/figures/dad.json');

const lines = readFileSync(csvPath, 'utf8').trim().split('\n');
const header = lines[0].split(',');
const iT = header.indexOf('created_at');
const iP = header.indexOf('price_per_unit');
if (iT < 0 || iP < 0) throw new Error(`unexpected columns: ${header.join(',')}`);

const rows = lines
  .slice(1)
  .map((l) => l.split(','))
  .map((c) => ({ t: Date.parse(c[iT]), p: Number(c[iP]) }))
  .filter((r) => Number.isFinite(r.t) && Number.isFinite(r.p))
  .sort((a, b) => a.t - b.t);

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const quantile = (xs, q) => { const s = [...xs].sort((a, b) => a - b); const i = (s.length - 1) * q; const lo = Math.floor(i); return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (i - lo); };
const groupBy = (keyOf) => rows.reduce((m, r) => { const k = keyOf(r.t); (m.get(k) ?? m.set(k, []).get(k)).push(r.p); return m; }, new Map());

const HOUR = 3600 * 1000, DAY = 24 * HOUR;
const hourly = [...groupBy((t) => Math.floor(t / HOUR) * HOUR)].map(([t, ps]) => ({ t: new Date(t).toISOString(), v: +median(ps).toFixed(2), n: ps.length }));
const daily = [...groupBy((t) => Math.floor(t / DAY) * DAY)].map(([t, ps]) => ({ t: new Date(t).toISOString(), p25: +quantile(ps, 0.25).toFixed(2), p75: +quantile(ps, 0.75).toFixed(2), n: ps.length }));
const splitAt = new Date(rows[Math.floor(rows.length * 0.8)].t).toISOString(); // chronological 80/20 train/test split

const data = {
  source: { file: 'gold_ore.csv', rows: rows.length, from: new Date(rows[0].t).toISOString(), to: new Date(rows[rows.length - 1].t).toISOString(), generatedAt: new Date().toISOString().slice(0, 10) },
  hourly,
  daily,
  splitAt,
  // transcribed from the Gold Ore run output (2026-01-29) — see the case-study screenshots
  forecast: [
    { t: '2026-01-30', v: 33.11, lo: 28.38, hi: 37.84 },
    { t: '2026-01-31', v: 35.42, lo: 31.42, hi: 39.42 },
    { t: '2026-02-01', v: 35.45, lo: 31.65, hi: 39.26 },
    { t: '2026-02-02', v: 35.46, lo: 31.67, hi: 39.24 },
    { t: '2026-02-03', v: 36.63, lo: 32.61, hi: 40.66 },
    { t: '2026-02-04', v: 36.58, lo: 32.52, hi: 40.64 },
    { t: '2026-02-05', v: 15.67, lo: 7.69, hi: 23.66 },
  ],
  models: [
    { name: 'Lasso', r2: 0.996, cv: 0.991, sd: 0.002 },
    { name: 'Linear', r2: 0.996, cv: 0.986, sd: 0.008 },
    { name: 'Ridge', r2: 0.996, cv: 0.986, sd: 0.007 },
    { name: 'Elastic Net', r2: 0.996, cv: 0.989, sd: 0.004 },
    { name: 'Ensemble (voting)', r2: 0.995, cv: 0.995, sd: 0.001, highlight: true },
    { name: 'Gradient Boosting', r2: 0.989, cv: 0.978, sd: 0.02 },
    { name: 'MLP', r2: 0.985, cv: 0.996, sd: 0.001 },
    { name: 'XGBoost', r2: 0.897, cv: 0.897, sd: 0.062 },
    { name: 'Random Forest', r2: 0.697, cv: 0.809, sd: 0.057 },
    { name: 'Extra Trees', r2: 0.4, cv: 0.545, sd: 0.219 },
    { name: 'SVR', r2: 0.291, cv: 0.107, sd: 0.883 },
  ],
  pipeline: { pages: 124, rows: 6164, duplicates: 0, outliersRemoved: 139, kept: 6025, featuresBefore: 32, featuresAfter: 15, train: 4820, test: 1205, ensembleR2: 0.995, horizonDays: 7, ciHalfWidth: 4.63 },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
process.stderr.write(`rows ${rows.length} · hourly points ${hourly.length} · days ${daily.length} · split ${splitAt}\nwrote ${out}\n`);
