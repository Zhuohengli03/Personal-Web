// Builds src/data/figures/ops.json — the aggregates behind the "Operations & product-selection analytics"
// exhibits — from the five anonymized daily sales tables (brands AA–EE, masked ASINs, October 2023).
//
//   node scripts/ops-figures.mjs <folder with amazon_sales_{ad,all,detail,stock,url}.csv>
//
// Only aggregates leave this script: daily totals, per-listing ad efficiency for the month, one listing's
// price / rank / units series and the stock-out count. No row-level data is written.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/ops-figures.mjs <csv folder>'); process.exit(1); }

const csv = (name) => {
  const text = readFileSync(join(dir, name), 'utf8').replace(/^﻿/, '');
  const [head, ...rows] = text.trim().split(/\r?\n/);
  const cols = head.split(',');
  return rows.map((r) => Object.fromEntries(r.split(',').map((v, i) => [cols[i], v])));
};
const ad = csv('amazon_sales_ad.csv');
const all = csv('amazon_sales_all.csv');
const detail = csv('amazon_sales_detail.csv');
const stock = csv('amazon_sales_stock.csv');
const url = csv('amazon_sales_url.csv');

const iso = (d) => { const [y, m, day] = d.split('/').map(Number); return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`; };
const r = (n, p = 2) => Math.round(n * 10 ** p) / 10 ** p;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// --- daily totals from the summary table, plus the stock-out count from inventory × orders ---
const days = [...new Set(all.map((x) => iso(x.date)))].sort();
const selling = new Set(detail.filter((x) => Number(x.units_count) > 0).map((x) => `${x.brand}|${x.country}|${x.asin}`));
const stockOn = new Map(stock.map((x) => [`${x.brand}|${x.country}|${x.asin}|${iso(x.update_day)}`, Number(x.in_stock)]));
const daily = days.map((d) => {
  const rows = all.filter((x) => iso(x.date) === d);
  const zero = [...selling].filter((k) => (stockOn.get(`${k}|${d}`) ?? 0) === 0).length;
  return {
    d,
    units: sum(rows.map((x) => Number(x.sales_total))),
    gmv: r(sum(rows.map((x) => Number(x.gmv_total))), 0),
    reads: sum(rows.map((x) => Number(x.read))),
    buyers: sum(rows.map((x) => Number(x.buyer))),
    refunds: sum(rows.map((x) => Number(x.sales_refund))),
    outOfStock: zero,
  };
});

// --- per-brand month totals ---
const brands = ['AA', 'BB', 'CC', 'DD', 'EE'].map((b) => ({
  brand: b,
  units: sum(all.filter((x) => x.brand === b).map((x) => Number(x.sales_total))),
  gmv: r(sum(all.filter((x) => x.brand === b).map((x) => Number(x.gmv_total))), 0),
}));

// --- ad efficiency per advertised listing, whole month ---
const byLink = new Map();
for (const x of ad) {
  const k = `${x.brand}|${x.country}|${x.asin}`;
  const a = byLink.get(k) ?? { brand: x.brand, country: x.country, spend: 0, adGmv: 0, clicks: 0, impressions: 0, adUnits: 0 };
  a.spend += Number(x.cost); a.adGmv += Number(x.gmv_ad); a.clicks += Number(x.clicks); a.impressions += Number(x.impressions); a.adUnits += Number(x.sales_ad);
  byLink.set(k, a);
}
const ads = [...byLink.values()]
  .filter((a) => a.spend > 0)
  .map((a) => ({ brand: a.brand, country: a.country, spend: r(a.spend), adGmv: r(a.adGmv), acos: a.adGmv > 0 ? r(a.spend / a.adGmv, 3) : null, ctr: a.impressions ? r(a.clicks / a.impressions, 4) : null, adUnits: a.adUnits }))
  .sort((a, b) => b.spend - a.spend);
const adTotals = { spend: r(sum(ads.map((a) => a.spend)), 0), adGmv: r(sum(ads.map((a) => a.adGmv)), 0), links: ads.length };
adTotals.acos = r(adTotals.spend / adTotals.adGmv, 3);

// --- the best-selling listing: price, rank and units by day ---
const top = detail.reduce((m, x) => { const k = `${x.brand}|${x.country}|${x.asin}`; m.set(k, (m.get(k) ?? 0) + Number(x.units_count)); return m; }, new Map());
const [topKey] = [...top.entries()].sort((a, b) => b[1] - a[1])[0];
const [tb, tc, ta] = topKey.split('|');
const unitsOn = new Map(detail.filter((x) => x.brand === tb && x.country === tc && x.asin === ta).map((x) => [iso(x.update_day), Number(x.units_count)]));
const page = url.filter((x) => x.country === tc && x.asin === ta);
const topLink = {
  brand: tb, country: tc, monthUnits: top.get(topKey),
  series: days.map((d) => {
    const p = page.find((x) => iso(x.insert_date) === d);
    return { d, price: p ? Number(p.price) : null, rank: p ? Number(p.sales_rank) : null, units: unitsOn.get(d) ?? 0 };
  }),
};

const out = {
  source: 'five anonymized daily sales exports (ads, orders, inventory, listing page, daily totals), brands AA–EE, masked ASINs',
  month: '2023-10',
  rows: { ad: ad.length, all: all.length, detail: detail.length, stock: stock.length, url: url.length },
  listings: new Set(detail.map((x) => `${x.country}|${x.asin}`)).size,
  sellingListings: selling.size,
  marketplaces: [...new Set(all.map((x) => x.country))].sort(),
  daily, brands, ads, adTotals, topLink,
};
writeFileSync(new URL('../src/data/figures/ops.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`ops.json: ${days.length} days, ${ads.length} advertised listings, top listing ${tb}/${tc} with ${topLink.monthUnits} units; blended ACoS ${adTotals.acos}`);
