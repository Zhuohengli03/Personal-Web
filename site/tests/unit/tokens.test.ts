import { describe, it, expect } from 'vitest';
import { fill, flatten, siteTokens } from '../../src/lib/tokens';

const github = { generatedAt: 'x', repos: { 'Guqin-AI': { commits: 1246, firstCommit: '2026-02-12', lastCommit: '2026-10-05', weeklyCommits: [1] } } };

describe('tokens', () => {
  it('fills nested and flat tokens', () => {
    expect(fill('{lingxian.users} users as of {lingxian.asOf}', flatten({ lingxian: { users: 94, asOf: '2026-09' } }))).toBe('94 users as of 2026-09');
  });
  it('throws on an unknown token instead of printing it', () => {
    expect(() => fill('{nope}', {})).toThrow(/unknown token "\{nope\}"/);
  });
  it('siteTokens rounds commits and exposes metrics.json', () => {
    const t = siteTokens(github, 'Guqin-AI');
    expect(t.commits).toBe('1,200+');
    expect(t.commitsExact).toBe('1,246');
    expect(t['lingxian.users']).toBe(94);
    expect(typeof t['lingxian.asOf']).toBe('string');
  });
});
