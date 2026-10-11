import { test, expect } from '@playwright/test';

for (const locale of ['en', 'zh'] as const) {
  for (const width of [1280, 390]) {
    test(`experience navigation clears the sticky header (${locale}, ${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const home = locale === 'zh' ? '/zh/' : '/';
      for (const source of [home, `${home}work/guqin-ai/`]) {
        await page.goto(source);
        await page.evaluate(() => document.fonts.ready);
        await page.locator('header nav a[href$="#experience"]').click();
        await expect(page).toHaveURL(new RegExp(`${home}#experience$`));
        await expect(page.locator('#experience .section-head')).toHaveClass(/is-visible/);
        await expect.poll(async () => {
          const heading = await page.locator('#experience h2').boundingBox();
          const header = await page.locator('.site-header').boundingBox();
          if (!heading || !header) return false;
          const gap = heading.y - (header.y + header.height);
          return gap >= 16 && gap <= 32;
        }).toBe(true);
      }
    });
  }
}
