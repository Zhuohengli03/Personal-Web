import { describe, it, expect } from 'vitest';
import en from '../../src/i18n/en.json';
import zh from '../../src/i18n/zh.json';
import { t, altPath, localePath, missingKeys } from '../../src/i18n';

describe('i18n completeness', () => {
  it('zh has every en key and vice versa', () => {
    expect(missingKeys(en, zh)).toEqual([]);
    expect(missingKeys(zh, en)).toEqual([]);
  });
});

describe('t', () => {
  it('resolves dot paths', () => {
    expect(t('en')('nav.work')).toBe('Work');
    expect(t('zh')('nav.work')).toBe('作品');
  });
  it('throws on a missing key', () => {
    expect(() => t('en')('nav.nope')).toThrow(/nav\.nope/);
  });
});

describe('paths', () => {
  it('altPath mirrors between locales', () => {
    expect(altPath('/', 'en')).toBe('/zh/');
    expect(altPath('/zh/', 'zh')).toBe('/');
    expect(altPath('/work/guqin-ai/', 'en')).toBe('/zh/work/guqin-ai/');
    expect(altPath('/zh/work/guqin-ai/', 'zh')).toBe('/work/guqin-ai/');
  });
  it('localePath prefixes zh only', () => {
    expect(localePath('/work/x/', 'en')).toBe('/work/x/');
    expect(localePath('/work/x/', 'zh')).toBe('/zh/work/x/');
    expect(localePath('/', 'zh')).toBe('/zh/');
  });
});
