import { test, expect } from '@playwright/test';

for (const [path, heading] of [['/', 'Beyond work'], ['/zh/', '工作之外']] as const) {
  test(`life section on ${path}: five rows, photos only where there are photos`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    const rows = page.locator('#life .row');
    await expect(rows).toHaveCount(5);
    const photoRow = page.locator('#life .row[data-hobby="photo"]');
    await expect(photoRow).toHaveClass(/has-photos/);
    const originals = photoRow.locator('.track > li:not(.dup) img');
    expect(await originals.count()).toBeGreaterThanOrEqual(12);
    // the strip is doubled so the loop is seamless; the copies are hidden from assistive tech and the tab order
    await expect(photoRow.locator('.track > li.dup')).toHaveCount(await originals.count());
    await expect(photoRow.locator('.track > li.dup button').first()).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#life .row[data-hobby="cooking"] .track')).toHaveCount(0);
  });
}

test('a strip opens the lightbox', async ({ page }) => {
  await page.goto('/');
  // the track is moving, so Playwright would wait forever for it to settle: park the pointer on the strip first (that pauses it)
  await page.evaluate(() => document.querySelector('#life')?.scrollIntoView());
  const strip = page.locator('#life .row[data-hobby="photo"] .strip');
  await strip.hover({ force: true });
  await page.locator('#life .track button').first().click();
  await expect(page.locator('dialog[open] img')).toHaveAttribute('src', /\.webp/);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('the strip drifts, pauses on hover, and stands still under reduced motion', async ({ browser }) => {
  const moving = await browser.newPage({ reducedMotion: 'no-preference' });
  await moving.goto('/');
  const track = moving.locator('#life .row[data-hobby="photo"] .track');
  await moving.evaluate(() => document.querySelector('#life')?.scrollIntoView());
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe('life-strip');
  await moving.locator('#life .row[data-hobby="photo"] .strip').hover({ force: true }); // force: the element never "settles" while it drifts
  expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');
  await moving.close();
  const still = await browser.newPage({ reducedMotion: 'reduce' });
  await still.goto('/');
  const t2 = still.locator('#life .row[data-hobby="photo"] .track');
  expect(await t2.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await expect(t2.locator('li.dup').first()).toBeHidden();
  await still.close();
});
