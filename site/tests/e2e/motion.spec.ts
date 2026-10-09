import { test, expect } from '@playwright/test';

test('reduced motion: everything visible immediately, no transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const el = page.locator('#analytics li').first();
  await expect(el).toHaveCSS('opacity', '1');
  await expect(el).toHaveCSS('transform', 'none');
});

test('with motion: reveal elements become visible after scrolling into view', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const el = page.locator('#education article').first();
  await el.scrollIntoViewIfNeeded();
  await expect(el).toHaveClass(/is-visible/);
  await expect(el).toHaveCSS('opacity', '1');
});

test('JS disabled: content is visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/js/);
  await expect(page.locator('#analytics li').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('h1')).toHaveCSS('opacity', '1');
  await ctx.close();
});
