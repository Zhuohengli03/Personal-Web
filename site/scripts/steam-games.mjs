// Pulls the owner's Steam playtime and rewrites the games data in src/data/life.{en,zh}.json:
//   STEAM_API_KEY=… node scripts/steam-games.mjs        (fetches; writes src/data/figures/steam.json)
//   node scripts/steam-games.mjs                        (no key: rebuilds the cards from the saved steam.json)
// The "PC · Steam" group of the games page lists every game with any playtime, sorted by hours, hours on every
// card; the home strip gets the same hours. Titles and covers come from the curated map below; games not in it get
// their store names (EN + ZH) and library art fetched once and remembered in src/data/figures/steam-apps.json.
// The key stays in the environment; nothing secret is written.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STEAM_ID = '76561199179240743';
const MIN_MINUTES = 1;   // anything with playtime counts
const NOT_GAMES = new Set([431960, 632810]); // Wallpaper Engine, Soundpad Demo
const key = process.env.STEAM_API_KEY;

// app id → cover file, titles, genre label (shown when under HOURS_SHOWN_FROM) and an optional rank suffix
const KNOWN = {
  393380: { cover: 'games/squad.jpg', en: 'Squad', zh: 'Squad', genre: ['tactical shooter', '战术射击'] },
  2016590: { cover: 'games/dark-and-darker.jpg', en: 'Dark and Darker', zh: 'Dark and Darker', genre: ['extraction RPG', '搜打撤'], rank: ['Demigod', '半神'] },
  730: { cover: 'games/cs2.jpg', en: 'Counter-Strike 2', zh: 'CS2', genre: ['shooter', '射击'], rank: ['Premier A', '完美 A'] },
  1867240: { cover: 'games/wardogs.jpg', en: 'Wardogs', zh: 'Wardogs', genre: ['team shooter', '团队射击'] },
  1238810: { cover: 'games/battlefield-v.jpg', en: 'Battlefield V', zh: '战地 5', genre: ['shooter', '射击'] },
  359550: { cover: 'games/rainbow-six-siege.jpg', en: 'Rainbow Six Siege', zh: '彩虹六号：围攻', genre: ['tactical shooter', '战术射击'] },
  1938090: { cover: 'games/call-of-duty.jpg', en: 'Call of Duty', zh: '使命召唤', genre: ['shooter', '射击'] },
  1085660: { cover: 'games/destiny-2.jpg', en: 'Destiny 2', zh: '命运 2', genre: ['looter shooter', '刷宝射击'] },
  261550: { cover: 'games/bannerlord.jpg', en: 'Mount & Blade II: Bannerlord', zh: '骑马与砍杀 II：霸主', genre: ['medieval sandbox', '中世纪沙盒'] },
  236390: { cover: 'games/war-thunder.jpg', en: 'War Thunder', zh: '战争雷霆', genre: ['vehicle combat', '载具对战'] },
  594650: { cover: 'games/hunt-showdown.jpg', en: 'Hunt: Showdown 1896', zh: '猎杀：对决 1896', genre: ['extraction shooter', '搜打撤'] },
  271590: { cover: 'games/gta-v.jpg', en: 'Grand Theft Auto V', zh: 'GTA V', genre: ['open world', '开放世界'] },
  242760: { cover: 'games/the-forest.jpg', en: 'The Forest', zh: '森林', genre: ['survival', '生存'] },
  225540: { cover: 'games/just-cause-3.jpg', en: 'Just Cause 3', zh: '正当防卫 3', genre: ['open-world action', '开放世界动作'] },
  289070: { cover: 'games/civilization-vi.jpg', en: 'Civilization VI', zh: '文明 6', genre: ['4X strategy', '回合策略'] },
  2358720: { cover: 'games/black-myth-wukong.jpg', en: 'Black Myth: Wukong', zh: '黑神话：悟空', genre: ['action RPG', '动作角色扮演'] },
  1222670: { cover: 'games/the-sims-4.jpg', en: 'The Sims 4', zh: '模拟人生 4', genre: ['life sim', '生活模拟'] },
  2507950: { cover: 'games/delta-force.jpg', en: 'Delta Force', zh: '三角洲行动', genre: ['tactical shooter', '战术射击'] },
};

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const cachePath = here('../src/data/figures/steam.json');
let steam;
if (key) {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) { console.error(`Steam API ${res.status}`); process.exit(1); }
  const owned = (await res.json()).response?.games ?? [];
  const games = owned
    .filter((g) => g.playtime_forever >= MIN_MINUTES && !NOT_GAMES.has(g.appid))
    .map((g) => ({ appid: g.appid, name: g.name, hours: Math.round(g.playtime_forever / 6) / 10 }))
    .sort((a, b) => b.hours - a.hours);
  steam = { asOf: new Date().toISOString().slice(0, 10), steamId: STEAM_ID, totalHours: Math.round(owned.reduce((n, g) => n + g.playtime_forever, 0) / 60), gameCount: owned.length, games };
  writeFileSync(cachePath, JSON.stringify(steam, null, 2) + '\n');
} else if (existsSync(cachePath)) {
  steam = JSON.parse(readFileSync(cachePath, 'utf8'));
  console.log(`STEAM_API_KEY not set: rebuilding from steam.json saved ${steam.asOf}`);
} else { console.error('STEAM_API_KEY is not set and there is no saved steam.json'); process.exit(1); }
const { games, asOf, totalHours } = steam;
const owned = { length: steam.gameCount };

// games outside the curated map: store names in both languages and library art, fetched once and remembered
const autoPath = here('../src/data/figures/steam-apps.json');
const auto = existsSync(autoPath) ? JSON.parse(readFileSync(autoPath, 'utf8')) : {};
const clean = (name) => (name ?? '').replace(/[™®]/g, '').replace(/\s{2,}/g, ' ').trim();
const storeName = async (appid, lang) => {
  const r = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=${lang}&filters=basic`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const d = r.ok ? (await r.json())?.[appid] : null;
  return d?.success ? clean(d.data.name) : null;
};
const fetchCover = async (appid) => {
  const file = `games/app-${appid}.jpg`;
  if (existsSync(here(`../src/assets/life/${file}`))) return file;
  for (const name of ['library_600x900.jpg', 'header.jpg']) {
    const r = await fetch(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/${name}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (r.ok && (r.headers.get('content-type') ?? '').startsWith('image/')) { writeFileSync(here(`../src/assets/life/${file}`), Buffer.from(await r.arrayBuffer())); return file; }
  }
  return null;
};
for (const g of games.filter((g) => !KNOWN[g.appid] && !auto[g.appid])) {
  const [en, zh, cover] = await Promise.all([storeName(g.appid, 'english'), storeName(g.appid, 'schinese'), fetchCover(g.appid)]);
  auto[g.appid] = { en: en ?? clean(g.name), zh: zh ?? en ?? clean(g.name), cover };
  console.log(`added ${g.appid}: ${auto[g.appid].en} / ${auto[g.appid].zh}${cover ? '' : ' (no cover)'}`);
}
writeFileSync(autoPath, JSON.stringify(auto, null, 2) + '\n');
const entry = (appid) => KNOWN[appid] ?? auto[appid];
const fmtHours = (h, loc) => `${(h >= 10 ? Math.round(h) : h).toLocaleString('en-US')}${loc === 'en' ? ' h' : ' 小时'}`;
const card = (g, loc) => {
  const k = entry(g.appid);
  const meta = [fmtHours(g.hours, loc), k.rank?.[loc === 'en' ? 0 : 1]].filter(Boolean).join(' · ');
  const c = { image: k.cover ?? undefined, title: k[loc], meta, href: `https://store.steampowered.com/app/${g.appid}/` };
  if (!c.image || !existsSync(here(`../src/assets/life/${c.image}`))) delete c.image;
  return c;
};
for (const loc of ['en', 'zh']) {
  const path = here(`../src/data/life.${loc}.json`);
  const life = JSON.parse(readFileSync(path, 'utf8'));
  const hobby = life.hobbies.find((h) => h.id === 'games');
  const pc = hobby.page.groups.find((g) => g.id === 'pc');
  pc.cards = games.filter((g) => entry(g.appid)).map((g) => card(g, loc));
  pc.note = loc === 'en'
    ? `Steam playtime as of ${asOf}: every game ever played, sorted by hours.`
    : `Steam 时长截至 ${asOf}：玩过的全部游戏，按时长排序。`;
  // the home strip keeps its curated order; Steam games on it get their live hours
  hobby.cards = hobby.cards.map((c) => {
    const appid = Number((c.href ?? '').match(/\/app\/(\d+)/)?.[1]);
    const g = games.find((x) => x.appid === appid);
    return g && entry(appid) ? card(g, loc) : c;
  });
  writeFileSync(path, JSON.stringify(life, null, 2) + '\n');
}
console.log(`${games.length} games with playtime (of ${owned.length}); ${totalHours} h in total; as of ${asOf}`);
