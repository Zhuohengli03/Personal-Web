import { test, expect, type Locator } from '@playwright/test';

/** Parse `translate(Xpx, Ypx) translateX(-50%) rotate(Rrad)` into numbers. */
async function pose(card: Locator): Promise<{ x: number; y: number; r: number } | null> {
  const t = await card.evaluate((el) => el.style.transform);
  const m = /translate\(([-\d.e]+)px, ([-\d.e]+)px\) translateX\(-50%\) rotate\(([-\d.e]+)rad\)/.exec(t);
  return m ? { x: +m[1], y: +m[2], r: +m[3] } : null;
}
const atRest = (p: { x: number; y: number; r: number } | null) =>
  !!p && Math.abs(p.x - 110) < 0.5 && Math.abs(p.r) < 0.01 && (Math.abs(p.y - 133) < 1 || Math.abs(p.y - 77) < 1);

test('badge drops and comes to rest below its anchor', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('[data-badge]')).toHaveAttribute('data-live', '');
  const card = page.locator('[data-card]');
  await expect(card).toBeVisible();
  await expect.poll(async () => atRest(await pose(card)), { timeout: 15_000 }).toBe(true);
});

test('reduced motion: badge is static at its rest pose, no live physics', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-badge]')).not.toHaveAttribute('data-live', '');
  const card = page.locator('[data-card]');
  await expect(card).toBeVisible();
  expect(await card.evaluate((el) => el.style.transform)).toBe('');
  expect(await card.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
});

test('badge can be dragged and swings back', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('[data-card]');
  await expect.poll(async () => atRest(await pose(card)), { timeout: 15_000 }).toBe(true);
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2 + 20, { steps: 8 });
  const dragged = await pose(card);
  expect(dragged && Math.abs(dragged.r) > 0.1).toBe(true);
  await page.mouse.up();
  await expect.poll(async () => atRest(await pose(card)), { timeout: 15_000 }).toBe(true);
});
