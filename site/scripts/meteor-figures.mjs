// Builds src/data/figures/meteor.json — the aggregates behind the "Meteor Madness" exhibits — from one pull of the
// project's own backend (JSON saved from /api/close-approaches, /api/fireballs, /api/neo-feed) plus sweep.json written by
// scripts/meteor-shoot.mjs.   node scripts/meteor-figures.mjs <data dir>
// Only aggregates and small per-object points leave this script (no names beyond asteroid designations, which are public).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/meteor-figures.mjs <data dir>'); process.exit(1); }
const read = (n) => JSON.parse(readFileSync(join(dir, n), 'utf8'));
const approaches = read('close-approaches.json'), fireballs = read('fireballs.json'), neo = read('neo-feed.json'), sweep = read('sweep.json');
const r = (v, p = 3) => Math.round(v * 10 ** p) / 10 ** p;
const LD = 0.002569; // one lunar distance in AU

// close approaches: date, distance in lunar distances, relative velocity, absolute magnitude (size proxy)
const ca = approaches.map((a) => ({ des: a.des.trim(), cd: a.cd, jd: Number(a.jd), dist: r(Number(a.dist) / LD, 2), v: r(Number(a.v_rel), 1), h: Number(a.h) }))
  .filter((a) => Number.isFinite(a.dist) && Number.isFinite(a.v));
const byTime = [...approaches].sort((a, b) => Number(a.jd) - Number(b.jd));
const dates = [byTime[0].cd.slice(0, 11), byTime[byTime.length - 1].cd.slice(0, 11)];
const closest = [...ca].sort((a, b) => a.dist - b.dist)[0];
const insideMoon = ca.filter((a) => a.dist < 1).length;

// fireballs since 2015: count and summed impact energy (kt) per year, plus the biggest
const byYear = {};
for (const f of fireballs) { const y = f.date.slice(0, 4); byYear[y] = byYear[y] ?? { year: y, n: 0, kt: 0 }; byYear[y].n++; byYear[y].kt += Number(f['impact-e']) || 0; }
const years = Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year)).map((y) => ({ ...y, kt: r(y.kt, 1) }));
const biggest = [...fireballs].sort((a, b) => Number(b['impact-e']) - Number(a['impact-e']))[0];

const out = {
  pulledAt: new Date().toISOString().slice(0, 10),
  approaches: { n: ca.length, from: dates[0], to: dates[1], insideMoon, closest: { des: closest.des, dist: closest.dist, cd: closest.cd }, points: ca },
  fireballs: { n: fireballs.length, since: fireballs.map((f) => f.date).sort()[0].slice(0, 10), years, biggest: { date: biggest.date.slice(0, 10), kt: Number(biggest['impact-e']), lat: `${biggest.lat}${biggest['lat-dir']}`, lon: `${biggest.lon}${biggest['lon-dir']}` } },
  neo: { n: neo.length, hazardous: neo.filter((x) => x.hazardous === 'yes').length, from: neo.map((x) => x.date).sort()[0], to: neo.map((x) => x.date).sort().at(-1) },
  sweep: { ...sweep, rows: sweep.rows.map((s) => ({ d: s.d, mt: r(s.mt, 4), crater: r(s.crater, 0), depth: r(s.depth, 0), blastKm: r(s.blastKm, 1), seismic: r(s.seismic, 1), tsunamiM: r(s.tsunamiM, 1) })) },
};
writeFileSync(new URL('../src/data/figures/meteor.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ ...out, approaches: { ...out.approaches, points: `${out.approaches.points.length} points` } }, null, 1));
