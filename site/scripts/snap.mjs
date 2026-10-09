#!/usr/bin/env node
// Responsive review screenshots of the preview server → test-results/. Run from site/ with the preview on :4321.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch();
let overflow = 0;
for (const [w, h] of [[390, 844], [768, 1024], [1280, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  for (const path of ['/', '/zh/', '/work/guqin-ai/', '/zh/work/dad-market-forecast/']) {
    await page.goto(`http://localhost:4321${path}`, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForTimeout(800); // fonts and lazy images settle
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (wide) { overflow++; process.stderr.write(`HORIZONTAL OVERFLOW at ${w}px on ${path}\n`); }
    await page.screenshot({ path: `test-results/snap-${w}${path.replace(/\//g, '_')}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
process.stderr.write(overflow ? `${overflow} overflow(s)\n` : 'no horizontal overflow\n');
