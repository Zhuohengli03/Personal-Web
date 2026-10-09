#!/usr/bin/env node
// Review audit: builds, serves dist on :4321, takes responsive snapshots and runs Lighthouse.
// Run from site/: node scripts/audit.mjs   (results in audit-results/)
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;
mkdirSync('audit-results', { recursive: true });

execFileSync('npm', ['run', 'build'], { stdio: 'ignore' });
const server = spawn('./node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${BASE}/`)).ok) break; } catch { /* not up yet */ }
  await new Promise((r) => setTimeout(r, 1000));
}

// 1. Responsive snapshots + horizontal-overflow check
const browser = await chromium.launch();
let overflow = 0;
for (const [w, h] of [[390, 844], [768, 1024], [1280, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  for (const path of ['/', '/zh/', '/work/guqin-ai/', '/zh/work/dad-market-forecast/']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForTimeout(800);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (wide) { overflow++; process.stderr.write(`HORIZONTAL OVERFLOW at ${w}px on ${path}\n`); }
    await page.screenshot({ path: `audit-results/snap-${w}${path.replace(/\//g, '_')}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
process.stderr.write(overflow ? `${overflow} overflow(s)\n` : 'no horizontal overflow\n');

// 2. Lighthouse
const runs = [
  ['home-mobile', '/', []],
  ['home-desktop', '/', ['--preset=desktop']],
  ['case-mobile', '/work/guqin-ai/', []],
];
for (const [name, path, extra] of runs) {
  const out = `audit-results/lh-${name}.json`;
  try {
    execFileSync('npx', ['--yes', 'lighthouse', `${BASE}${path}`, ...extra, '--quiet', '--chrome-flags=--headless=new', '--output=json', `--output-path=${out}`], { stdio: 'ignore' });
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const scores = Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
    process.stderr.write(`${name} ${r.runtimeError ? r.runtimeError.code + ' ' : ''}${JSON.stringify(scores)}\n`);
  } catch (e) {
    process.stderr.write(`${name} lighthouse failed: ${e instanceof Error ? e.message : String(e)}\n`);
  }
}

server.kill();
try { execFileSync('./node_modules/.bin/astro', ['preview', 'stop'], { stdio: 'ignore' }); } catch { /* none running */ }
