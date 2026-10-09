import { test, expect } from '@playwright/test';

for (const [path, heading] of [['/', 'Beyond work'], ['/zh/', '生活之外']] as const) {
  test(`life section on ${path}: cards filter the photo wall`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    const cards = page.locator('#life .hobby');
    await expect(cards).toHaveCount(5);
    const all = page.locator('#life [data-wall] > li');
    const total = await all.count();
    expect(total).toBeGreaterThanOrEqual(12);
    await expect(page.locator('#life [data-wall] > li:visible')).toHaveCount(total);

    const photoCard = page.locator('#life .hobby[data-hobby="photo"]');
    await photoCard.click();
    await expect(photoCard).toHaveAttribute('aria-pressed', 'true');
    const shown = await page.locator('#life [data-wall] > li:visible').count();
    expect(shown).toBe(await page.locator('#life [data-wall] > li[data-hobby="photo"]').count());

    await photoCard.click(); // pressing again clears the filter
    await expect(photoCard).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#life [data-wall] > li:visible')).toHaveCount(total);
  });
}

test('a hobby without photos is not an active filter', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#life .hobby[data-hobby="cooking"]')).toBeDisabled();
});

test('photo wall opens the lightbox', async ({ page }) => {
  await page.goto('/');
  await page.locator('#life [data-wall] button').first().scrollIntoViewIfNeeded();
  await page.locator('#life [data-wall] button').first().click();
  await expect(page.locator('dialog[open] img')).toHaveAttribute('src', /\.webp/);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});
