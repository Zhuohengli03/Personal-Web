import { test, expect } from '@playwright/test';

const cases = [
  ['/work/guqin-ai/', 'en', 'Problem', 6],
  ['/zh/work/guqin-ai/', 'zh-CN', '问题', 6],
  ['/work/dad-market-forecast/', 'en', 'Problem', 2],
  ['/zh/work/dad-market-forecast/', 'zh-CN', '问题', 2],
] as const;

for (const [path, lang, problem, images] of cases) {
  test(`case ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: problem })).toBeVisible();
    await expect(page.locator('.gallery img')).toHaveCount(images);
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

test('DaD case shows the exhibits drawn from real data', async ({ page }) => {
  await page.goto('/work/dad-market-forecast/');
  const ex = page.locator('[data-exhibits]');
  await expect(ex.locator('figure.exhibit')).toHaveCount(3);
  await expect(ex.locator('svg').first()).toBeVisible();
  await expect(ex.locator('.flow li')).toHaveCount(9);
  // hover tooltip on the forecast chart
  const svg = ex.locator('[data-forecast-chart] svg');
  await svg.scrollIntoViewIfNeeded();
  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(ex.locator('[data-forecast-chart] .tip')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Raw output' })).toBeVisible();
});
