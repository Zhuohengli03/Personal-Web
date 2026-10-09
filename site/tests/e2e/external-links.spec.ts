import { test, expect } from '@playwright/test';

// Every link that leaves the page — other sites and the résumé PDFs — opens in a new tab with rel=noopener.
for (const path of ['/', '/zh/', '/work/guqin-ai/', '/zh/work/dad-market-forecast/']) {
  test(`external and PDF links open in a new tab on ${path}`, async ({ page }) => {
    await page.goto(path);
    const offenders = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors
        .filter((a) => {
          const href = a.getAttribute('href') ?? '';
          const leaves = /^https?:\/\//.test(href) && !href.startsWith('https://lizhuoheng.com');
          return (leaves || href.endsWith('.pdf')) && !(a.getAttribute('target') === '_blank' && /\bnoopener\b/.test(a.getAttribute('rel') ?? ''));
        })
        .map((a) => a.getAttribute('href')),
    );
    expect(offenders).toEqual([]);
    expect(await page.locator('a[target="_blank"]').count()).toBeGreaterThan(0);
  });
}
