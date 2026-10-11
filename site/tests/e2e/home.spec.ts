import { test, expect } from '@playwright/test';

for (const [path, lang, work] of [['/', 'en', 'Selected work'], ['/zh/', 'zh-CN', '精选作品']] as const) {
  test(`home ${path} renders all sections`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: work })).toBeVisible();
    await expect(page.locator('#work article')).toHaveCount(4);
    await expect(page.locator('#analytics li')).toHaveCount(3);
    await expect(page.locator('#more article')).toHaveCount(3);
    await expect(page.locator('#experience li').first()).toBeVisible();
    await expect(page.locator('#education .honors li')).not.toHaveCount(0); // honors are listed open, no collapse
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
    expect(html).not.toMatch(/amazon|亚马逊|google|谷歌/i); // the owner keeps these names off the site
    const external = [...html.matchAll(/<script[^>]*\ssrc="(https?:[^"]*)"/g)].map((m) => m[1]);
    for (const src of external) expect(src).toMatch(/^https:\/\/cloud\.umami\.is\//); // page-view analytics is the only third-party script
    expect(html).not.toMatch(/googletagmanager|google-analytics|gtag\(/); // no other trackers
    const footer = await page.locator('footer').innerHTML();
    expect(footer).not.toMatch(/WeChat|微信|QQ/); // messenger handles in contact
  });
}

test('the clicks worth counting carry analytics event names', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-umami-event="resume-download"][data-umami-event-lang="en"]')).toHaveCount(1);
  await expect(page.locator('[data-umami-event="email-click"]')).toHaveCount(2);           // hero and footer
  await expect(page.locator('footer [data-umami-event="outbound-linkedin"]')).toHaveCount(1);
  await expect(page.locator('#work [data-umami-event="case-open"]')).toHaveCount(4);
  await expect(page.locator('[data-umami-event="language-switch"][data-umami-event-to="zh"]')).toHaveCount(1);
  await expect(page.locator('#theme-toggle[data-umami-event="theme-toggle"]')).toHaveCount(1);
});

test('language switch from home lands on the other home', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-lang-switch]');
  await expect(page).toHaveURL(/\/zh\/$/);
});
