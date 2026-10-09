import { describe, it, expect } from 'vitest';
import { findUnpaired, slugOf } from '../../src/lib/pairing';

describe('project pairing', () => {
  it('returns [] when every en slug has a zh twin', () => {
    expect(findUnpaired(['en/a', 'zh/a', 'en/b', 'zh/b'])).toEqual([]);
  });
  it('names the orphan with its locale', () => {
    expect(findUnpaired(['en/a', 'zh/a', 'en/b'])).toEqual(['en/b']);
    expect(findUnpaired(['zh/c'])).toEqual(['zh/c']);
  });
  it('slugOf strips the locale folder', () => {
    expect(slugOf({ id: 'en/guqin-ai' })).toBe('guqin-ai');
    expect(slugOf({ id: 'zh/guqin-ai' })).toBe('guqin-ai');
  });
});
