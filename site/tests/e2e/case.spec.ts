import { test, expect } from '@playwright/test';

const cases = [
  ['/work/guqin-ai/', 'en', 'Problem'],
  ['/zh/work/guqin-ai/', 'zh-CN', '问题'],
  ['/work/dad-market-forecast/', 'en', 'Problem'],
  ['/zh/work/dad-market-forecast/', 'zh-CN', '问题'],
] as const;

for (const [path, lang, problem] of cases) {
  test(`case ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: problem })).toBeVisible();
    await expect(page.locator('.gallery img')).toHaveCount(6);
    await expect(page.locator('.gallery img').first()).toHaveAttribute('alt', /.+/);
    expect(errors).toEqual([]);
  });
}

test('lightbox opens and closes', async ({ page }) => {
  await page.goto('/work/dad-market-forecast/');
  await page.locator('.gallery button').first().click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('language switch on a case page mirrors the path', async ({ page }) => {
  await page.goto('/zh/work/guqin-ai/');
  await page.click('[data-lang-switch]');
  await expect(page).toHaveURL(/\/work\/guqin-ai\/$/);
});

test('lingxian links to the live site, not a placeholder', async ({ page }) => {
  await page.goto('/work/guqin-ai/');
  await expect(page.locator('a[href="https://lingxian.app"]').first()).toBeVisible();
});
