import { describe, it, expect } from 'vitest';
import { profileSchema, loadProfile } from '../../src/lib/profile';

describe('profile data', () => {
  it('en and zh both validate', () => {
    expect(() => loadProfile('en')).not.toThrow();
    expect(() => loadProfile('zh')).not.toThrow();
  });
  it('rejects a phone number anywhere in contact', () => {
    const bad = { ...loadProfile('en'), contact: { email: 'a@b.co', github: 'x', phone: '+1 555' } };
    expect(() => profileSchema.parse(bad)).toThrow();
  });
  it('en and zh have the same counts', () => {
    const en = loadProfile('en');
    const zh = loadProfile('zh');
    expect(zh.stats.length).toBe(en.stats.length);
    expect(zh.analytics.length).toBe(en.analytics.length);
    expect(zh.miniProjects.length).toBe(en.miniProjects.length);
    expect(zh.education[1].honors.length).toBe(en.education[1].honors.length);
  });
});
