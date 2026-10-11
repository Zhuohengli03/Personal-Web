// Builds src/data/figures/ums.json — the aggregates behind the "E-commerce user & marketing analytics"
// exhibits — from the three anonymized display-ad tables used in the Aug–Oct 2023 internship.
//
//   node scripts/ums-figures.mjs <folder with ad.csv, click.csv, user.csv>
//
// ad.csv    ad_id, cate_id, campaign_id, customer, brand, price
// click.csv userid, time_stamp, ad_id, nonclk, clk          (one row per impression)
// user.csv  userid, gender, age level, consumption level, shopping depth, student, city tier  (GBK header)
//
// Only aggregates leave this script: totals, click rate and user mix per price band, and the five
// K-means segments of clicking users. No row-level data is written.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/ums-figures.mjs <csv folder>'); process.exit(1); }

const lines = (name, encoding = 'utf8') => readFileSync(join(dir, name), encoding).replace(/^﻿/, '').trim().split(/\r?\n/).slice(1);
const r = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// --- ad table: price per ad ---
const adLines = lines('ad.csv');
const price = new Map(); const campaigns = new Set(); const brands = new Set();
for (const l of adLines) {
  const [id, , campaign, , brand, p] = l.split(',');
  price.set(id, Number(p)); campaigns.add(campaign); brands.add(brand);
}

// --- user table: coded attribute levels (header is GBK; columns are positional) ---
const userLines = lines('user.csv', 'latin1');
const user = new Map();
let userNullGenderAge = 0;
for (const l of userLines) {
  const [id, gender, age, consume, shop] = l.split(',');
  if (gender === '' || age === '') { userNullGenderAge++; continue; }
  user.set(id, { gender: Number(gender), age: Number(age), consume: consume === '' ? null : Number(consume), shop: Number(shop) });
}

// --- impression log joined to ads and users ---
const BANDS = [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800, Infinity];
const bandLabel = (i) => (i === BANDS.length - 2 ? `${BANDS[i]}+` : `${BANDS[i]}–${BANDS[i + 1]}`);
const bandOf = (p) => { let i = 0; while (p >= BANDS[i + 1]) i++; return i; };
const bands = BANDS.slice(0, -1).map((_, i) => ({ band: bandLabel(i), imp: 0, clk: 0, consume: [0, 0, 0], shop: [0, 0, 0], age: [0, 0, 0, 0, 0, 0, 0] }));
const clickLines = lines('click.csv');
let clicks = 0, joined = 0;
const usersSeen = new Set(); const adsSeen = new Set(); const days = new Set();
const perUser = new Map(); // clickers only, built below
for (const l of clickLines) {
  const [uid, ts, adId, , clk] = l.split(',');
  usersSeen.add(uid); adsSeen.add(adId); days.add(new Date(Number(ts) * 1000).toISOString().slice(0, 10));
  const c = Number(clk); clicks += c;
  const p = price.get(adId); const u = user.get(uid);
  if (p === undefined || !u) continue;
  joined++;
  const b = bands[bandOf(p)];
  b.imp++; b.clk += c;
  if (u.consume !== null) b.consume[u.consume - 1]++;
  b.shop[u.shop - 1]++; b.age[u.age]++;
  let s = perUser.get(uid);
  if (!s) { s = { imp: 0, clk: 0, priceSum: 0, u }; perUser.set(uid, s); }
  s.imp++; if (c) { s.clk++; s.priceSum += p; }
}
const impressions = clickLines.length;
const share = (xs) => { const t = sum(xs); return xs.map((x) => r(x / t)); };
const bandsOut = bands.map((b) => ({ band: b.band, imp: b.imp, clk: b.clk, ctr: r(b.clk / b.imp), share: r(b.imp / joined), consume: share(b.consume), shop: share(b.shop), age: share(b.age) }));

// --- K-means (k = 5) on clicking users: shopping depth, click rate, log price of clicked ads ---
// Mirrors the report's choice of features. Seeded k-means++ so the build is reproducible.
const clickers = [...perUser.values()].filter((s) => s.clk > 0).map((s) => ({ shop: s.u.shop, ctr: s.clk / s.imp, price: s.priceSum / s.clk, u: s.u }));
const feats = clickers.map((c) => [c.shop, c.ctr, Math.log10(Math.max(1, c.price))]);
const mean = feats[0].map((_, j) => sum(feats.map((f) => f[j])) / feats.length);
const sd = feats[0].map((_, j) => Math.sqrt(sum(feats.map((f) => (f[j] - mean[j]) ** 2)) / feats.length));
const X = feats.map((f) => f.map((v, j) => (v - mean[j]) / sd[j]));
let seed = 20231006; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 2 ** 32; return seed / 2 ** 32; };
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const K = 5;
let centers = [X[Math.floor(rnd() * X.length)]];
while (centers.length < K) {
  const dist = X.map((x) => Math.min(...centers.map((c) => d2(x, c))));
  let t = rnd() * sum(dist), i = 0;
  while ((t -= dist[i]) > 0) i++;
  centers.push(X[Math.min(i, X.length - 1)]);
}
let assign = new Array(X.length).fill(-1);
for (let it = 0; it < 100; it++) {
  let moved = 0;
  const next = assign.map((a, i) => { let best = 0, bd = Infinity; centers.forEach((c, k) => { const d = d2(X[i], c); if (d < bd) { bd = d; best = k; } }); if (best !== a) moved++; return best; });
  assign = next;
  centers = centers.map((_, k) => { const m = X.filter((_, i) => assign[i] === k); return m.length ? [0, 1, 2].map((j) => sum(m.map((x) => x[j])) / m.length) : centers[k]; });
  if (!moved) break;
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const mode = (xs) => { const c = new Map(); for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1); return [...c.entries()].sort((a, b) => b[1] - a[1])[0][0]; };
const clusters = [...Array(K).keys()].map((k) => {
  const m = clickers.filter((_, i) => assign[i] === k);
  return {
    users: m.length, share: r(m.length / clickers.length),
    ctr: r(sum(m.map((c) => c.ctr)) / m.length), price: r(median(m.map((c) => c.price)), 0),
    shop: r(sum(m.map((c) => c.shop)) / m.length, 2), female: r(m.filter((c) => c.u.gender === 2).length / m.length), age: mode(m.map((c) => c.u.age)),
  };
}).filter((c) => c.users > 0);
// RFM-style tier from the report's rule: F = click rate, M = price of what was clicked, each against the median centre.
const fMed = median(clusters.map((c) => c.ctr)), mMed = median(clusters.map((c) => c.price));
const composite = (c) => clusters.filter((o) => o.ctr < c.ctr).length + clusters.filter((o) => o.price < c.price).length;
const want = { keep: (c) => c.ctr > fMed && c.price > mMed, develop: (c) => c.ctr > fMed && c.price <= mMed, winback: (c) => c.ctr <= fMed && c.price > mMed };
const left = new Set(clusters);
const tiers = [];
for (const [key, ok] of Object.entries(want)) {
  const pick = [...left].filter(ok).sort((a, b) => composite(b) - composite(a))[0];
  if (pick) { tiers.push({ key, ...pick }); left.delete(pick); }
}
const rest = [...left].sort((a, b) => composite(b) - composite(a));
const spare = ['keep', 'develop', 'winback'].filter((k) => !tiers.some((t) => t.key === k));
rest.forEach((c, i) => tiers.push({ key: ['general', 'low'][i] ?? spare.shift(), ...c }));
const segments = tiers.sort((a, b) => b.share - a.share);

const out = {
  period: { from: [...days].sort()[0], to: [...days].sort().at(-1), days: days.size },
  rows: { ad: adLines.length, click: impressions, user: userLines.length, userDropped: userNullGenderAge, joined, clickers: clickers.length },
  totals: { impressions, clicks, ctr: r(clicks / impressions), users: usersSeen.size, usersMatched: perUser.size, ads: adsSeen.size, campaigns: campaigns.size, brands: brands.size },
  bands: bandsOut,
  segments,
};
writeFileSync(new URL('../src/data/figures/ums.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ period: out.period, rows: out.rows, totals: out.totals }, null, 1));
console.table(bandsOut.map((b) => ({ band: b.band, imp: b.imp, ctr: b.ctr, share: b.share, c1: b.consume[0], c3: b.consume[2] })));
console.table(segments);
