#!/usr/bin/env node
// Refreshes site/src/data/github.json using the gh CLI (owner token → private repos included).
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OWNER = 'Zhuohengli03';
const REPOS = ['Guqin-AI', 'DaD-Market-Forecast', 'Crawler', 'Hackthon-Meteror', 'WebDesigner', 'Qinghua-DeepEvol', 'Xingyuanguzheng'];
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../site/src/data/github.json');

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function weekly(dates, start, end) {
  const WEEK = 7 * 24 * 3600 * 1000;
  const s = Date.parse(`${start}T00:00:00Z`);
  const e = Date.parse(`${end}T23:59:59.999Z`);
  const n = Math.max(1, Math.ceil((e - s + 1) / WEEK));
  const arr = new Array(n).fill(0);
  for (const d of dates) {
    const t = Date.parse(d);
    if (t >= s && t <= e) arr[Math.floor((t - s) / WEEK)]++;
  }
  return arr;
}

const repos = {};
for (const name of REPOS) {
  process.stderr.write(`${name}… `);
  const dates = gh(['api', '--paginate', `repos/${OWNER}/${name}/commits?per_page=100`, '--jq', '.[].commit.author.date'])
    .trim()
    .split('\n')
    .filter(Boolean);
  if (dates.length === 0) throw new Error(`${name}: no commits returned — check the repo name and gh auth`);
  const languages = Object.keys(JSON.parse(gh(['api', `repos/${OWNER}/${name}/languages`])));
  const sorted = [...dates].sort();
  const firstCommit = sorted[0].slice(0, 10);
  const lastCommit = sorted[sorted.length - 1].slice(0, 10);
  repos[name] = { commits: dates.length, firstCommit, lastCommit, weeklyCommits: weekly(dates, firstCommit, lastCommit), languages };
  process.stderr.write(`${dates.length} commits\n`);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), repos }, null, 2) + '\n');
process.stderr.write(`wrote ${out}\n`);
