// Records the crawler's Streamlit UI running one crawl as a series of PNG frames (every 0.5 s), for scripts/crawler-gif.py.
//   node scripts/crawler-record.mjs <streamlit url> <frames dir> <msedgedriver path> [items]
// The app must already be running (streamlit run main.py --server.port 8512 in ~/Cursor/Crawler_c).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [url, dir, driverPath, items = '40'] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 700 }, deviceScaleFactor: 1 });
let n = 0;
// Streamlit scrolls its main section, not the window: keep the newest log lines in view for every frame
const toBottom = () => p.evaluate(() => { for (const el of document.querySelectorAll('[data-testid="stMain"], section.main, [data-testid="stAppViewContainer"]')) el.scrollTop = el.scrollHeight; window.scrollTo(0, document.body.scrollHeight); });
const frame = async () => { await toBottom(); await p.screenshot({ path: `${dir}/${String(n++).padStart(4, '0')}.png` }); };
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
await frame();
await p.getByRole('button', { name: /进入动态页爬取/ }).click(); await p.waitForTimeout(2000);
const commit = async (loc, value) => { await loc.fill(value); await loc.press('Tab'); await p.waitForTimeout(900); };
await commit(p.getByRole('textbox', { name: /目标URL/ }), 'https://juejin.cn/');
await commit(p.getByRole('spinbutton', { name: /爬取新闻数量/ }), items);
await commit(p.getByRole('textbox', { name: /Edge驱动路径/ }), driverPath);
await p.evaluate(() => { for (const el of document.querySelectorAll('[data-testid="stMain"], section.main')) el.scrollTop = 0; }); await p.screenshot({ path: `${dir}/${String(n++).padStart(4, '0')}.png` });
const adv = p.getByText('高级筛选', { exact: true }).first(); await adv.scrollIntoViewIfNeeded(); await adv.click(); await p.waitForTimeout(1500);
await frame();
const start = p.getByRole('button', { name: /开始爬取/ }); await start.scrollIntoViewIfNeeded(); await frame(); await start.click();
const t0 = Date.now();
while (Date.now() - t0 < 8 * 60_000) {
  await frame();
  if (await p.getByText(/^📋|结果/).first().isVisible().catch(() => false) && await p.locator('[data-testid="stDataFrame"]').first().isVisible().catch(() => false)) break;
  await p.waitForTimeout(500);
}
await p.mouse.move(5, 5); await p.waitForTimeout(600);   // off the buttons, so no tooltip sits on the results
for (let i = 0; i < 6; i++) { await frame(); await p.waitForTimeout(500); }
console.log(`frames: ${n}, seconds: ${Math.round((Date.now() - t0) / 1000)}`);
await b.close();
