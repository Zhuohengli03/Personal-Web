#!/usr/bin/env node
// Builds src/data/figures/dad.json from a DaD Market Forecast *holdout* run (the project's
// data/runs/holdout/*.json, not committed here):
//   node scripts/dad-figures.mjs ~/Cursor/Darker\ Market/data/runs/holdout/<run>.json
// Keeps: the last week of training, every holdout hour (actual / prediction / naive / interval),
// per-day windows, overall metrics and the run's metadata.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) throw new Error('usage: node scripts/dad-figures.mjs <holdout-run.json>');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/figures/dad.json');
const run = JSON.parse(readFileSync(src, 'utf8'));
const r = (v, d = 2) => (v === null || v === undefined || Number.isNaN(v) ? null : +Number(v).toFixed(d));

const data = {
  source: { runId: run.run_id, createdAt: run.created_at.slice(0, 10), item: run.item, generatedAt: new Date().toISOString().slice(0, 10) },
  season: { id: run.season.id, name: run.season.name, start: run.season.start.slice(0, 10), end: run.season.end?.slice(0, 10) ?? null },
  listings: run.listings,
  split: run.split_ts,
  trainHours: run.train_hours,
  testHours: run.test_hours,
  horizon: run.horizon,
  nominalCoverage: run.nominal_coverage,
  models: run.request.models,
  trainFrac: run.request.train_frac,
  selected: { name: run.selected.name, members: run.selected.members.map((m) => ({ name: m.name, weight: r(m.weight, 3) })) },
  trainSkill: r(run.train_skill, 4),
  metrics: Object.fromEntries(Object.entries(run.metrics).map(([k, v]) => [k, r(v, 4)])),
  windows: run.windows.map((w) => ({ origin: w.origin.slice(0, 10), mae: r(w.mae), naiveMae: r(w.naive_mae), skill: r(w.skill, 3), coverage: r(w.coverage, 3), direction: r(w.direction_acc, 3), n: w.scored_hours })),
  trainTail: run.train_tail.map((p) => ({ t: p.ts, a: r(p.actual) })),
  points: run.points.map((p) => ({ t: p.ts, a: r(p.actual), p: r(p.pred), n: r(p.naive), lo: r(p.lower), hi: r(p.upper) })),
  warnings: run.warnings,
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data) + '\n');
process.stderr.write(`${data.source.item} · ${data.season.name} · ${data.points.length} holdout hours · ${data.windows.length} windows · wrote ${out}\n`);
