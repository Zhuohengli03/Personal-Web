import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadLife, lifeMismatch, lifeSchema } from '../../src/lib/life';

describe('life data', () => {
  it('en and zh validate and mirror each other', () => {
    const en = loadLife('en');
    const zh = loadLife('zh');
    expect(lifeMismatch(en, zh)).toEqual([]);
  });
  it('every photo file exists under src/assets/life', () => {
    const missing = loadLife('en').photos.map((p) => p.file).filter((f) => !existsSync(join(process.cwd(), 'src/assets/life', f)));
    expect(missing).toEqual([]);
  });
  it('rejects a photo that points at an unknown hobby', () => {
    const bad = { ...loadLife('en'), photos: [{ file: 'photo/p01.jpg', hobby: 'nope', caption: 'x' }] };
    expect(() => lifeSchema.parse(bad)).toThrow(/unknown hobby/);
  });
});
