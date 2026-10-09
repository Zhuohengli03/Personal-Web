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

test('every page has hreflang alternates and a canonical', () => {
  const dist = join(process.cwd(), 'dist');
  for (const file of htmlFiles(dist)) {
    if (file.endsWith('404.html')) continue;
    const html = readFileSync(file, 'utf8');
    expect(html, file).toMatch(/hreflang="en"/);
    expect(html, file).toMatch(/hreflang="zh-CN"/);
    expect(html, file).toMatch(/rel="canonical"/);
  }
});

test('404 page renders', async ({ page }) => {
  const res = await page.goto('/definitely-missing/');
  // astro preview may serve 404.html with 200; GitHub Pages serves it with 404
  expect([200, 404]).toContain(res?.status());
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Page not found');
});
