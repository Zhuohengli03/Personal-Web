#!/usr/bin/env node
// Refreshes site/src/data/github.json using the gh CLI (owner token → private repos included).
// Node ≥ 23 strips TypeScript types natively, so the site's own bucketing helper is reused here.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { weeklyBuckets } from '../site/src/lib/github.ts';

const OWNER = 'Zhuohengli03';
const REPOS = ['Guqin-AI', 'DaD-Market-Forecast', 'Crawler', 'Hackthon-Meteror', 'WebDesigner', 'Qinghua-DeepEvol', 'Xingyuanguzheng'];
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../site/src/data/github.json');

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const repos = {};
for (const name of REPOS) {
  process.stderr.write(`${name}… `);
  const dates = gh(['api', '--paginate', `repos/${OWNER}/${name}/commits?per_page=100`, '--jq', '.[].commit.author.date'])
    .trim()
    .split('\n')
    .filter(Boolean);
  if (dates.length === 0) throw new Error(`${name}: no commits returned — check the repo name and gh auth`);
  const sorted = [...dates].sort();
  const firstCommit = sorted[0].slice(0, 10);
  const lastCommit = sorted[sorted.length - 1].slice(0, 10);
  repos[name] = { commits: dates.length, firstCommit, lastCommit, weeklyCommits: weeklyBuckets(dates, firstCommit, lastCommit) };
  process.stderr.write(`${dates.length} commits\n`);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), repos }, null, 2) + '\n');
process.stderr.write(`wrote ${out}\n`);
