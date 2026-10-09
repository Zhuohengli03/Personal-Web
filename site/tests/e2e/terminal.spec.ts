import { test, expect } from '@playwright/test';

test('terminal types the command, then prints the profile with real commit data', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const term = page.locator('[data-terminal]');
  await expect(term).toBeVisible();
  await expect(term).toHaveAttribute('data-animate', '');
  await expect(term).toHaveAttribute('data-done', '', { timeout: 10_000 });
  await expect(term.locator('[data-cmd]')).toHaveText('felix');
  await expect(term.locator('.row')).toHaveCount(6);
  await expect(term.locator('.row').last()).toHaveCSS('opacity', '1');
  await expect(term).toContainText('1,200+'); // Guqin-AI commits, rounded, from github.json
  await expect(term).not.toContainText('2026-10'); // no volatile dates in the hero panel
  await expect(term).toContainText('lingxian.app');
});

test('reduced motion: the terminal is fully printed at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const term = page.locator('[data-terminal]');
  await expect(term).not.toHaveAttribute('data-animate', '');
  await expect(term.locator('.row').first()).toHaveCSS('opacity', '1');
  await expect(term.locator('[data-cmd]')).toBeVisible();
});

test('zh terminal is localized', async ({ page }) => {
  await page.goto('/zh/');
  await expect(page.locator('[data-terminal]')).toContainText('游戏策划');
});
