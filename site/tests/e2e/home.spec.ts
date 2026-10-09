import { test, expect } from '@playwright/test';

for (const [path, lang, work] of [['/', 'en', 'Selected work'], ['/zh/', 'zh-CN', '精选作品']] as const) {
  test(`home ${path} renders all sections`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: work })).toBeVisible();
    await expect(page.locator('#work article')).toHaveCount(2);
    await expect(page.locator('#analytics li')).toHaveCount(3);
    await expect(page.locator('#more article')).toHaveCount(3);
    await expect(page.locator('#experience li').first()).toBeVisible();
    await expect(page.locator('#education details')).toHaveCount(1);
    await expect(page.locator('.waffle').first()).toBeVisible();
    const stat = await page.locator('#stats dd').nth(1).textContent();
    expect(stat).toMatch(/^\d{1,3}(,\d{3})*\+$/);
    await expect(page.locator('#stats dd').nth(2)).toContainText(lang === 'zh-CN' ? /2026 年 \d{1,2} 月/ : /2026-\d{2}/); // dated metric, from metrics.json
    expect(errors).toEqual([]);
  });
}

for (const path of ['/', '/zh/']) {
  test(`no phone number or messenger handle on ${path}`, async ({ page }) => {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/\+1\s?\d{3}[\s-]?\d{3}|\+86\s?\d{3}|1[3-9]\d{9}/); // phone numbers anywhere
    const footer = await page.locator('footer').innerHTML();
    expect(footer).not.toMatch(/WeChat|微信|QQ/); // messenger handles in contact
  });
}

test('language switch from home lands on the other home', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-lang-switch]');
  await expect(page).toHaveURL(/\/zh\/$/);
});
