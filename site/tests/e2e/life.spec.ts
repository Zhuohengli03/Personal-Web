import { test, expect } from '@playwright/test';

for (const [path, heading] of [['/', 'Beyond work'], ['/zh/', '工作之外']] as const) {
  test(`life section on ${path}: five rows, photos only where there are photos`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    const rows = page.locator('#life .row');
    await expect(rows).toHaveCount(3); // photography, cooking, games
    await expect(page.locator('#life .tile')).toHaveCount(7); // guqin, swimming and the five small hobbies
    const photoRow = page.locator('#life .row[data-hobby="photo"]');
    await expect(photoRow).toHaveClass(/has-photos/);
    const originals = photoRow.locator('.track > li:not(.dup) img');
    expect(await originals.count()).toBeGreaterThanOrEqual(12);
    // the strip is doubled so the loop is seamless; the copies are hidden from assistive tech and the tab order
    await expect(photoRow.locator('.track > li.dup')).toHaveCount(await originals.count());
    await expect(photoRow.locator('.track > li.dup button').first()).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#life .row[data-hobby="cooking"] .track')).toHaveCount(0);
    const games = page.locator('#life .row[data-hobby="games"]');
    await expect(games).toHaveClass(/has-cards/);
    await expect(games.locator('.track > li:not(.dup)')).toHaveCount(6);
    await expect(games.locator('.track > li:not(.dup) img')).toHaveCount(6); // every game has a cover (Steam library art, or a cropped capsule for Wardogs)
    await expect(games.locator('.track > li:not(.dup) .card-meta').first()).toContainText(/h|小时/);
    const steam = page.locator('#life .row[data-hobby="games"] a.link');
    await expect(steam).toHaveAttribute('href', /steamcommunity\.com\/profiles\/\d+/);
    await expect(steam).toHaveAttribute('target', '_blank');
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

for (const [path, lang, mobile] of [['/life/games/', 'en', 'Mobile'], ['/zh/life/games/', 'zh-CN', '手游']] as const) {
  test(`games page ${path}: PC games (hours above 200 h) and mobile games apart`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    const pc = page.locator('main .group[data-group="pc"]'), mob = page.locator('main .group[data-group="mobile"]');
    await expect(pc.locator('h2')).toContainText('Steam');
    expect(await pc.locator('.cards li').count()).toBeGreaterThanOrEqual(13);
    await expect(pc.locator('.cards li .meta').first()).toContainText(/h|小时/); // the heavy ones lead, with hours
    await expect(mob.locator('h2')).toContainText(mobile);
    await expect(mob.locator('.cards li')).toHaveCount(2);
    await expect(page.locator('main .cards img').first()).toHaveAttribute('alt', /.+/);
  });
}

test('the games row is one link to its page, with a button-like outline on hover', async ({ page }) => {
  await page.goto('/');
  const label = page.locator('#life .row[data-hobby="games"] .label');
  await expect(label).toHaveClass(/linked/);
  await label.hover();
  expect(await label.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  // clicking the blurb (not the title) still opens the page: the title's link is stretched over the label
  const box = (await label.locator('.blurb').boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); // lands on the stretched link, not the text
  await expect(page).toHaveURL(/\/life\/games\/$/);
});
