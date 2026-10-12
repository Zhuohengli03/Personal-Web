// Pulls the owner's Steam playtime and rewrites the games data in src/data/life.{en,zh}.json:
//   STEAM_API_KEY=… node scripts/steam-games.mjs
// Writes src/data/figures/steam.json (app id, name, hours — games with 20 h or more, software excluded) and from it
// the "PC · Steam" group of the games page plus the hours on the home strip. Titles, covers and genre labels come
// from the curated map below; a new game above 20 h is reported so it can be added. The key stays in the
// environment; nothing secret is written.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STEAM_ID = '76561199179240743';
const MIN_HOURS = 20, HOURS_SHOWN_FROM = 200;
const NOT_GAMES = new Set([431960]); // Wallpaper Engine
const key = process.env.STEAM_API_KEY;
if (!key) { console.error('STEAM_API_KEY is not set'); process.exit(1); }

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

const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1&format=json`;
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!res.ok) { console.error(`Steam API ${res.status}`); process.exit(1); }
const owned = (await res.json()).response?.games ?? [];
const games = owned
  .map((g) => ({ appid: g.appid, name: g.name, hours: Math.round(g.playtime_forever / 60) }))
  .filter((g) => g.hours >= MIN_HOURS && !NOT_GAMES.has(g.appid))
  .sort((a, b) => b.hours - a.hours);
const asOf = new Date().toISOString().slice(0, 10);
const totalHours = Math.round(owned.reduce((n, g) => n + g.playtime_forever, 0) / 60);
const steam = { asOf, steamId: STEAM_ID, totalHours, gameCount: owned.length, games };
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
writeFileSync(here('../src/data/figures/steam.json'), JSON.stringify(steam, null, 2) + '\n');

const unknown = games.filter((g) => !KNOWN[g.appid]);
for (const g of unknown) console.warn(`not in the curated map (add cover + titles): ${g.appid} ${g.name} ${g.hours} h`);
const fmtHours = (h, loc) => `${h.toLocaleString('en-US')}${loc === 'en' ? ' h' : ' 小时'}`;
const card = (g, loc) => {
  const k = KNOWN[g.appid];
  const meta = g.hours >= HOURS_SHOWN_FROM ? [fmtHours(g.hours, loc), k.rank?.[loc === 'en' ? 0 : 1]].filter(Boolean).join(' · ') : k.genre[loc === 'en' ? 0 : 1];
  const c = { image: k.cover, title: k[loc], meta, href: `https://store.steampowered.com/app/${g.appid}/` };
  if (!existsSync(here(`../src/assets/life/${k.cover}`))) delete c.image;
  return c;
};
for (const loc of ['en', 'zh']) {
  const path = here(`../src/data/life.${loc}.json`);
  const life = JSON.parse(readFileSync(path, 'utf8'));
  const hobby = life.hobbies.find((h) => h.id === 'games');
  const pc = hobby.page.groups.find((g) => g.id === 'pc');
  pc.cards = games.filter((g) => KNOWN[g.appid]).map((g) => card(g, loc));
  pc.note = loc === 'en'
    ? `Steam playtime as of ${asOf}: every game with ${MIN_HOURS} h or more, hours shown from ${HOURS_SHOWN_FROM} h, the rest by genre.`
    : `Steam 时长截至 ${asOf}：列出 ${MIN_HOURS} 小时以上的全部游戏，${HOURS_SHOWN_FROM} 小时以上标时长，其余只标类型。`;
  // the home strip keeps its curated order; Steam games on it get their live hours
  hobby.cards = hobby.cards.map((c) => {
    const appid = Number((c.href ?? '').match(/\/app\/(\d+)/)?.[1]);
    const g = games.find((x) => x.appid === appid);
    return g && KNOWN[appid] ? card(g, loc) : c;
  });
  writeFileSync(path, JSON.stringify(life, null, 2) + '\n');
}
console.log(`${games.length} games with ${MIN_HOURS} h or more (of ${owned.length}); ${totalHours} h in total; as of ${asOf}`);
console.table(games.map((g) => ({ appid: g.appid, name: g.name, hours: g.hours, known: Boolean(KNOWN[g.appid]) })));
