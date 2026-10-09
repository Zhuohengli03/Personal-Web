import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
  });
}

test('every internal link in dist resolves to a file', () => {
  const dist = join(process.cwd(), 'dist');
  const broken: string[] = [];
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const href = m[1];
      const candidates = href.endsWith('/') ? [join(dist, href, 'index.html')] : [join(dist, href), join(dist, href, 'index.html')];
      if (!candidates.some(existsSync)) broken.push(`${file.replace(dist, '')} → ${href}`);
    }
  }
  expect(broken).toEqual([]);
});

test('every page has mirrored hreflang alternates and a canonical for its own locale', () => {
  const dist = join(process.cwd(), 'dist');
  for (const file of htmlFiles(dist)) {
    if (file.endsWith('404.html')) continue;
    const html = readFileSync(file, 'utf8');
    const rel = file.replace(dist, '').replace(/index\.html$/, ''); // e.g. /zh/work/guqin-ai/
    const isZh = rel.startsWith('/zh/');
    const bare = isZh ? rel.replace(/^\/zh/, '') : rel;
    const en = `https://lizhuoheng.com${bare}`;
    const zh = `https://lizhuoheng.com/zh${bare}`;
    expect(html, file).toContain(`<link rel="alternate" hreflang="en" href="${en}">`);
    expect(html, file).toContain(`<link rel="alternate" hreflang="zh-CN" href="${zh}">`);
    expect(html, file).toContain(`<link rel="alternate" hreflang="x-default" href="${en}">`);
    expect(html, file).toContain(`<link rel="canonical" href="${isZh ? zh : en}">`);
  }
});

test('CJK font stylesheets are linked on zh pages only', () => {
  const dist = join(process.cwd(), 'dist');
  for (const file of htmlFiles(dist)) {
    if (file.endsWith('404.html')) continue;
    const html = readFileSync(file, 'utf8');
    const links = (html.match(/<link rel="stylesheet" href="[^"]+"/g) ?? []).length;
    const isZh = file.replace(dist, '').startsWith('/zh/');
    // zh: base css + noto sans sc + noto serif sc; en: base css only
    expect(links, file).toBe(isZh ? 3 : 1);
  }
});

test('404 page renders', async ({ page }) => {
  const res = await page.goto('/definitely-missing/');
  // astro preview may serve 404.html with 200; GitHub Pages serves it with 404
  expect([200, 404]).toContain(res?.status());
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Page not found');
});
