import { test, expect } from '@playwright/test';

const cases = [
  ['/work/guqin-ai/', 'en', 'Problem', 6],
  ['/zh/work/guqin-ai/', 'zh-CN', '问题', 6],
  ['/work/dad-market-forecast/', 'en', 'Problem', 0],
  ['/zh/work/dad-market-forecast/', 'zh-CN', '问题', 0],
  ['/work/product-selection-analytics/', 'en', 'Problem', 0],
  ['/zh/work/product-selection-analytics/', 'zh-CN', '问题', 0],
  ['/work/user-marketing-analytics/', 'en', 'Problem', 0],
  ['/zh/work/user-marketing-analytics/', 'zh-CN', '问题', 0],
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
    if (images > 0) await expect(page.locator('.gallery img').first()).toHaveAttribute('alt', /.+/);
    expect(errors).toEqual([]);
  });
}

test('lightbox opens and closes', async ({ page }) => {
  await page.goto('/work/guqin-ai/');
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

for (const [locale, path, heading] of [
  ['en', '/work/dad-market-forecast/', 'Post-mortem'],
  ['zh', '/zh/work/dad-market-forecast/', '复盘与改进'],
] as const) {
  test(`DaD ${locale} case shows localized exhibits drawn from real data`, async ({ page }) => {
    await page.goto(path);
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
    await expect(ex.locator('[data-forecast-chart] .tip')).toContainText(locale === 'zh' ? /\d+月\d+日/ : /Sep|Oct/);
    await expect(ex.locator('[data-forecast-chart] .tip')).toContainText(locale === 'zh' ? '模型预测' : 'forecast');
    for (const axis of ['[data-forecast-chart] .xaxis', '.windows .xaxis']) {
      await expect(ex.locator(axis)).toContainText(locale === 'zh' ? /\d+月\d+日/ : /Sep|Oct/);
    }
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(ex).toContainText('61%'); // the honest coverage number is on the page
  });
}

for (const [locale, path, limits] of [
  ['en', '/work/product-selection-analytics/', 'Limits'],
  ['zh', '/zh/work/product-selection-analytics/', '局限'],
] as const) {
  test(`product-selection ${locale} case shows its five exhibits`, async ({ page }) => {
    await page.goto(path);
    const ex = page.locator('[data-exhibits]');
    await expect(ex.locator('figure.exhibit')).toHaveCount(5);
    await expect(ex.locator('.tree .leaves li')).toHaveCount(31);
    await expect(ex.locator('.flow li')).toHaveCount(10);
    await expect(ex.locator('svg')).toHaveCount(3);
    // per-day tooltip on the trend chart
    const svg = ex.locator('[data-trend-chart] svg');
    await svg.scrollIntoViewIfNeeded();
    const box = (await svg.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3);
    await expect(ex.locator('[data-trend-chart] .tip')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: limits })).toBeVisible();
    await expect(page.locator('html')).not.toContainText(/amazon|亚马逊/i);
  });
}

for (const [locale, path, limits] of [
  ['en', '/work/user-marketing-analytics/', 'Limits'],
  ['zh', '/zh/work/user-marketing-analytics/', '局限'],
] as const) {
  test(`user-marketing ${locale} case shows its five exhibits`, async ({ page }) => {
    await page.goto(path);
    const ex = page.locator('[data-exhibits]');
    await expect(ex.locator('figure.exhibit')).toHaveCount(5);
    await expect(ex.locator('.tree .leaves li')).toHaveCount(52);
    await expect(ex.locator('.flow li')).toHaveCount(10);
    await expect(ex.locator('svg')).toHaveCount(2);
    await expect(ex.locator('.segs .seg')).toHaveCount(5);
    // per-band tooltip on the click-rate chart
    const svg = ex.locator('[data-band-chart] svg');
    await svg.scrollIntoViewIfNeeded();
    const box = (await svg.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3);
    await expect(ex.locator('[data-band-chart] .tip')).toBeVisible();
    await expect(ex.locator('[data-band-chart] .tip')).toContainText('%');
    await expect(page.getByRole('heading', { level: 2, name: limits })).toBeVisible();
    await expect(page.locator('html')).not.toContainText(/amazon|亚马逊|google|谷歌/i);
  });
}
