// Builds src/data/figures/places.json — where the travel photos on the site were taken — from the original files,
// which still carry EXIF (the copies in src/assets/life/photo/ were stripped).
//   node scripts/photo-places.mjs <folder with the original photos>
// Each site photo is matched to its original by an average hash. A photo's GPS is snapped to the nearest city in
// the small gazetteer below and only that city's centroid is written: exact coordinates never leave this script.
// Photos without GPS join the place of a located photo from the same trip (dates no more than 3 days apart), or a
// place named in MANUAL (taken from the caption); both are marked as such in the output.
import { readdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import exifr from 'exifr';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/photo-places.mjs <originals folder>'); process.exit(1); }
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const siteDir = here('../src/assets/life/photo');

// city-level places (centroids), names in both languages; GPS within `km` snaps to the place
const GAZETTEER = [
  { id: 'newyork', en: 'New York & Jersey City', zh: '纽约与泽西城', country: ['United States', '美国'], lat: 40.72, lon: -74.02, km: 25 },
  { id: 'philadelphia', en: 'Philadelphia', zh: '费城', country: ['United States', '美国'], lat: 39.95, lon: -75.17, km: 30 },
  { id: 'sanfrancisco', en: 'San Francisco', zh: '旧金山', country: ['United States', '美国'], lat: 37.77, lon: -122.42, km: 30 },
  { id: 'osaka', en: 'Osaka', zh: '大阪', country: ['Japan', '日本'], lat: 34.69, lon: 135.5, km: 20 },
  { id: 'nara', en: 'Nara', zh: '奈良', country: ['Japan', '日本'], lat: 34.69, lon: 135.8, km: 15 },
  { id: 'ili', en: 'Ili, Xinjiang', zh: '新疆伊犁', country: ['China', '中国'], lat: 43.2, lon: 81.3, km: 250 },
];
const MANUAL = { 'p07.jpg': 'philadelphia', 'p16.jpg': 'nara' }; // no EXIF at all; the place is in the caption
const TRIP_GAP_DAYS = 3;

const ahash = async (file) => {
  const px = await sharp(file).rotate().greyscale().resize(16, 16, { fit: 'fill' }).raw().toBuffer();
  const mean = px.reduce((a, b) => a + b, 0) / px.length;
  return [...px].map((p) => (p > mean ? 1 : 0));
};
const dist = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0);
const km = (a, b) => {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const originals = await Promise.all(readdirSync(dir).filter((f) => /\.(jpe?g|heic|png)$/i.test(f)).map(async (f) => {
  const path = join(dir, f);
  const [hash, gps, meta] = await Promise.all([ahash(path), exifr.gps(path).catch(() => null), exifr.parse(path, ['DateTimeOriginal', 'CreateDate']).catch(() => null)]);
  const when = meta?.DateTimeOriginal ?? meta?.CreateDate ?? null;
  // EXIF times are the camera's local time with no zone; exifr reads them as this machine's local time, so take the
  // local calendar fields back out rather than converting to UTC (which would shift late shots by a day)
  const d = when ? new Date(when) : null;
  const date = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;
  return { file: f, hash, gps: gps && Number.isFinite(gps.latitude) ? { lat: gps.latitude, lon: gps.longitude } : null, date };
}));

const site = await Promise.all(readdirSync(siteDir).filter((f) => /\.jpe?g$/i.test(f)).sort().map(async (f) => ({ file: f, hash: await ahash(join(siteDir, f)) })));
const rows = site.map((s) => {
  const [best] = originals.map((o) => ({ o, d: dist(s.hash, o.hash) })).sort((a, b) => a.d - b.d);
  const o = best && best.d <= 24 ? best.o : null;
  let place = null, how = null;
  if (o?.gps) {
    const near = GAZETTEER.map((g) => ({ g, d: km(g, o.gps) })).sort((a, b) => a.d - b.d)[0];
    if (near.d <= near.g.km) { place = near.g.id; how = 'gps'; } else console.warn(`${s.file}: GPS is ${Math.round(near.d)} km from the nearest gazetteer place — add one`);
  }
  return { file: s.file, date: o?.date ?? null, place, how };
});
// same trip: a photo without GPS takes the place of a located photo within TRIP_GAP_DAYS, chaining through dated photos
const day = (d) => new Date(d).getTime() / 864e5;
let changed = true;
while (changed) {
  changed = false;
  for (const r of rows.filter((r) => !r.place && r.date)) {
    const near = rows.filter((x) => x.place && x.date && Math.abs(day(x.date) - day(r.date)) <= TRIP_GAP_DAYS).sort((a, b) => Math.abs(day(a.date) - day(r.date)) - Math.abs(day(b.date) - day(r.date)))[0];
    if (near) { r.place = near.place; r.how = 'trip'; changed = true; }
  }
}
for (const r of rows) if (!r.place && MANUAL[r.file]) { r.place = MANUAL[r.file]; r.how = 'caption'; }

const places = GAZETTEER.map((g) => {
  const mine = rows.filter((r) => r.place === g.id);
  const dates = mine.map((r) => r.date).filter(Boolean).sort();
  return { id: g.id, en: g.en, zh: g.zh, country: g.country, lat: g.lat, lon: g.lon, from: dates[0] ?? null, to: dates.at(-1) ?? null,
    photos: mine.map((r) => ({ file: `photo/${r.file}`, date: r.date, how: r.how })) };
}).filter((p) => p.photos.length > 0);
const unplaced = rows.filter((r) => !r.place).map((r) => `photo/${r.file}`);
writeFileSync(here('../src/data/figures/places.json'), JSON.stringify({ places, unplaced }, null, 2) + '\n');
console.table(rows.map((r) => ({ file: r.file, date: r.date, place: r.place, how: r.how })));
console.log(`${places.length} places · ${rows.filter((r) => r.how === 'gps').length} by GPS, ${rows.filter((r) => r.how === 'trip').length} by trip date, ${rows.filter((r) => r.how === 'caption').length} by caption · ${unplaced.length} unplaced`);
