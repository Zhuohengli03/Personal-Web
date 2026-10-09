export interface RepoStats {
  commits: number;
  firstCommit: string;
  lastCommit: string;
  weeklyCommits: number[];
}
export interface GithubData {
  generatedAt: string;
  repos: Record<string, RepoStats>;
}
export type Level = 0 | 1 | 2 | 3 | 4;

const DAY = 24 * 3600 * 1000;
const WEEK = 7 * DAY;

function utcMidnight(isoDate: string): number {
  return Date.UTC(+isoDate.slice(0, 4), +isoDate.slice(5, 7) - 1, +isoDate.slice(8, 10));
}

/** Buckets ISO date strings into consecutive 7-day windows starting at `start` (UTC midnight), through `end` inclusive. */
export function weeklyBuckets(dates: string[], start: string, end: string): number[] {
  const s = utcMidnight(start);
  const e = utcMidnight(end) + DAY - 1;
  const n = Math.max(1, Math.ceil((e - s + 1) / WEEK));
  const out = new Array<number>(n).fill(0);
  for (const d of dates) {
    const ts = Date.parse(d);
    if (Number.isNaN(ts) || ts < s || ts > e) continue;
    out[Math.floor((ts - s) / WEEK)]++;
  }
  return out;
}

/** 0 stays 0; positive counts map to 1–4 by quartile of the max. */
export function levels(counts: number[]): Level[] {
  const max = Math.max(0, ...counts);
  if (max === 0) return counts.map(() => 0);
  return counts.map((c) => (c === 0 ? 0 : (Math.min(4, Math.max(1, Math.ceil((c / max) * 4))) as Level)));
}

export function requireRepo(data: GithubData, name: string): RepoStats {
  const r = data.repos[name];
  if (!r) throw new Error(`github.json has no entry for "${name}". Run: node scripts/fetch-github.mjs`);
  return r;
}

export function formatCount(n: number): string {
  if (n < 100) return String(n);
  const floored = Math.floor(n / 100) * 100;
  return `${floored.toLocaleString('en-US')}+`;
}
