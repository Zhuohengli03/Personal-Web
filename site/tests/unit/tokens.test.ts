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
  it('localizes Chinese dates while preserving month precision and metric values', () => {
    const zh = siteTokens(github, 'Guqin-AI', 'zh');
    const en = siteTokens(github, 'Guqin-AI', 'en');
    expect(zh['lingxian.asOf']).toBe('2026 年 9 月');
    expect(zh.lastCommit).toBe('2026 年 10 月 5 日');
    expect(zh['lingxian.users']).toBe(en['lingxian.users']);
    expect(en['lingxian.asOf']).toBe('2026-09');
    expect(en.lastCommit).toBe('2026-10-05');
  });
});
