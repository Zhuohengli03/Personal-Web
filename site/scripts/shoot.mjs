#!/usr/bin/env node
// Screenshots of live sites → src/assets/**. Run from site/: node scripts/shoot.mjs
// Requires: npx playwright install chromium
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets');
const SHOTS = [
  { out: 'work/guqin-ai/01.png', url: 'https://lingxian.app/en' },
  { out: 'work/guqin-ai/02.png', url: 'https://lingxian.app/en', scrollTo: 'text=The score takes shape as you type' },
  { out: 'work/guqin-ai/03.png', url: 'https://lingxian.app/editor', settle: 4000 },
  { out: 'work/guqin-ai/04.png', url: 'https://lingxian.app/zhifa' },
  { out: 'work/guqin-ai/05.png', url: 'https://lingxian.app/pricing' },
  { out: 'work/guqin-ai/06.png', url: 'https://lingxian.app/blog' },
  { out: 'projects/webdesigner/01.png', url: 'https://web-designer-lac.vercel.app' },
  { out: 'projects/deepevol/01.png', url: 'https://qinghua-deep-evol.vercel.app' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
  reducedMotion: 'reduce',
  locale: 'en-US',
});
for (const s of SHOTS) {
  const page = await ctx.newPage();
  await page.goto(s.url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page
    .locator('button:has-text("接受"), button:has-text("Accept"), button:has-text("同意")')
    .first()
    .click({ timeout: 1500 })
    .catch(() => {});
  if (s.scrollTo) await page.locator(s.scrollTo).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(s.settle ?? 1500);
  const file = resolve(root, s.out);
  mkdirSync(dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage: false });
  process.stderr.write(`shot ${s.out}\n`);
  await page.close();
}
await browser.close();
