// Builds src/data/figures/places.json — where the travel photos on the site were taken — from the original files,
// which still carry EXIF (the copies in src/assets/life/photo/ were stripped).
//   node scripts/photo-places.mjs <folder with the original photos> [--library]
// --library also reads every item's location from the macOS Photos app (JavaScript for Automation; needs the
// Automation permission for Photos) and counts the library's photos per place. Raw coordinates stay in memory.
// Each site photo is matched to its original by an average hash. A photo's GPS is snapped to the nearest city in
// the small gazetteer below and only that city's centroid is written: exact coordinates never leave this script.
// Photos without GPS join the place of a located photo from the same trip (dates no more than 3 days apart), or a
// place named in MANUAL (taken from the caption); both are marked as such in the output.
import { readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import exifr from 'exifr';

const dir = process.argv[2];
const withLibrary = process.argv.includes('--library');
if (!dir) { console.error('usage: node scripts/photo-places.mjs <originals folder> [--library]'); process.exit(1); }
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const siteDir = here('../src/assets/life/photo');

// city-level places (centroids), names in both languages; a photo within `km` snaps to the nearest place.
// Airports, train and plane windows match nothing and are left out on purpose.
const US = ['United States', '美国'], JP = ['Japan', '日本'], KR = ['South Korea', '韩国'], CN = ['China', '中国'];
const GAZETTEER = [
  { id: 'newyork', en: 'New York & Jersey City', zh: '纽约与泽西城', country: US, lat: 40.72, lon: -74.02, km: 45 },
  { id: 'hudsonvalley', en: 'Hudson Valley', zh: '哈德逊河谷', country: US, lat: 41.32, lon: -74.13, km: 20 },
  { id: 'philadelphia', en: 'Philadelphia', zh: '费城', country: US, lat: 39.95, lon: -75.17, km: 30 },
  { id: 'orlando', en: 'Orlando', zh: '奥兰多', country: US, lat: 28.5, lon: -81.4, km: 45 },
  { id: 'sanfrancisco', en: 'San Francisco', zh: '旧金山', country: US, lat: 37.77, lon: -122.42, km: 40 },
  { id: 'norcalcoast', en: 'Northern California coast', zh: '北加州海岸', country: US, lat: 38.3, lon: -122.9, km: 25 },
  { id: 'osaka', en: 'Osaka', zh: '大阪', country: JP, lat: 34.69, lon: 135.5, km: 20 },
  { id: 'nara', en: 'Nara', zh: '奈良', country: JP, lat: 34.69, lon: 135.8, km: 15 },
  { id: 'seoul', en: 'Seoul', zh: '首尔', country: KR, lat: 37.56, lon: 126.98, km: 30 },
  { id: 'beijing', en: 'Beijing', zh: '北京', country: CN, lat: 39.9, lon: 116.4, km: 50 },
  { id: 'jinan', en: 'Jinan', zh: '济南', country: CN, lat: 36.65, lon: 117.12, km: 40 },
  { id: 'liaocheng', en: 'Liaocheng', zh: '聊城', country: CN, lat: 36.46, lon: 115.98, km: 35 },
  { id: 'nanjing', en: 'Nanjing', zh: '南京', country: CN, lat: 32.06, lon: 118.8, km: 35 },
  { id: 'zhenjiang', en: 'Zhenjiang', zh: '镇江', country: CN, lat: 32.19, lon: 119.45, km: 25 },
  { id: 'zhengzhou', en: 'Zhengzhou', zh: '郑州', country: CN, lat: 34.75, lon: 113.62, km: 45 },
  { id: 'kaifeng', en: 'Kaifeng', zh: '开封', country: CN, lat: 34.8, lon: 114.31, km: 25 },
  { id: 'luoyang', en: 'Luoyang', zh: '洛阳', country: CN, lat: 34.62, lon: 112.45, km: 40 },
  { id: 'xinyang', en: 'Xinyang', zh: '信阳', country: CN, lat: 32.13, lon: 114.07, km: 40 },
  { id: 'wuhan', en: 'Wuhan', zh: '武汉', country: CN, lat: 30.59, lon: 114.3, km: 40 },
  { id: 'xian', en: "Xi'an", zh: '西安', country: CN, lat: 34.27, lon: 108.94, km: 40 },
  { id: 'urumqi', en: 'Ürümqi', zh: '乌鲁木齐', country: CN, lat: 43.83, lon: 87.62, km: 40 },
  { id: 'duku', en: 'Duku Highway, Xinjiang', zh: '新疆独库公路', country: CN, lat: 43.9, lon: 84.8, km: 50 },
  { id: 'ili', en: 'Ili, Xinjiang', zh: '新疆伊犁', country: CN, lat: 43.6, lon: 82.2, km: 200 },
];
const MIN_LIBRARY_PHOTOS = 3;
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

// nearest place whose radius covers the point (nearest first, so Osaka and Nara split correctly)
const snap = (pt) => GAZETTEER.map((g) => ({ g, d: km(g, pt) })).filter((x) => x.d <= x.g.km).sort((a, b) => a.d - b.d)[0]?.g.id ?? null;

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
    const id = snap(o.gps);
    if (id) { place = id; how = 'gps'; } else console.warn(`${s.file}: GPS matches no gazetteer place — add one`);
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

// the Photos library: every item's location and date, snapped to the gazetteer and counted per place
const library = new Map();
let libraryTotal = 0, libraryLocated = 0, librarySkipped = [];
if (withLibrary) {
  const jxa = 'const P = Application("Photos"); const it = P.mediaItems; const l = it.location(), d = it.date();'
    + ' JSON.stringify(l.map((x, i) => [x && x[0] != null ? x[0] : null, x && x[1] != null ? x[1] : null, d[i] ? d[i].toISOString().slice(0, 10) : null]));';
  const items = JSON.parse(execFileSync('osascript', ['-l', 'JavaScript', '-e', jxa], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
  libraryTotal = items.length;
  const misses = [];
  for (const [lat, lon, date] of items) {
    if (lat == null || lon == null) continue;
    libraryLocated += 1;
    const id = snap({ lat, lon });
    if (!id) { misses.push([Math.round(lat), Math.round(lon)]); continue; }
    const e = library.get(id) ?? { n: 0, dates: [] };
    e.n += 1; if (date) e.dates.push(date);
    library.set(id, e);
  }
  // unmatched points, reported by whole degree only (airports, plane windows, places to add)
  const byCell = misses.reduce((m, c) => m.set(c.join(','), (m.get(c.join(',')) ?? 0) + 1), new Map());
  librarySkipped = [...byCell.entries()].sort((a, b) => b[1] - a[1]);
}

const month = (d) => (d ? d.slice(0, 7) : null);
const places = GAZETTEER.map((g) => {
  const mine = rows.filter((r) => r.place === g.id);
  const lib = library.get(g.id);
  const dates = [...mine.map((r) => r.date), ...(lib?.dates ?? [])].filter(Boolean).sort();
  return { id: g.id, en: g.en, zh: g.zh, country: g.country, lat: g.lat, lon: g.lon, from: month(dates[0]), to: month(dates.at(-1)),
    library: lib?.n ?? 0,
    photos: mine.map((r) => ({ file: `photo/${r.file}`, date: r.date, how: r.how })) };
}).filter((p) => p.photos.length > 0 || p.library >= MIN_LIBRARY_PHOTOS);
const unplaced = rows.filter((r) => !r.place).map((r) => `photo/${r.file}`);
const asOf = new Date().toISOString().slice(0, 10);
writeFileSync(here('../src/data/figures/places.json'), JSON.stringify({ asOf, library: withLibrary ? { total: libraryTotal, located: libraryLocated } : null, places, unplaced }, null, 2) + '\n');
console.table(rows.map((r) => ({ file: r.file, date: r.date, place: r.place, how: r.how })));
console.log(`${places.length} places · ${rows.filter((r) => r.how === 'gps').length} by GPS, ${rows.filter((r) => r.how === 'trip').length} by trip date, ${rows.filter((r) => r.how === 'caption').length} by caption · ${unplaced.length} unplaced`);
if (withLibrary) {
  console.log(`library: ${libraryTotal} items, ${libraryLocated} located; per place:`);
  console.table(places.map((p) => ({ place: p.en, library: p.library, site: p.photos.length, from: p.from, to: p.to })));
  console.log('left out (whole-degree cells → photos):', librarySkipped.map(([c, n]) => `${c}→${n}`).join('  '));
}
