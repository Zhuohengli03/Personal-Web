import { describe, it, expect } from 'vitest';
import { weeklyBuckets, levels, requireRepo, formatCount } from '../../src/lib/github';

describe('weeklyBuckets', () => {
  it('counts commits per 7-day window from start to end inclusive', () => {
    const dates = ['2026-02-12T11:36:51Z', '2026-02-13T00:00:00Z', '2026-02-20T00:00:00Z', '2026-03-05T00:00:00Z'];
    expect(weeklyBuckets(dates, '2026-02-12', '2026-03-05')).toEqual([2, 1, 0, 1]);
  });
  it('ignores dates outside the range', () => {
    expect(weeklyBuckets(['2025-01-01T00:00:00Z'], '2026-02-12', '2026-02-18')).toEqual([0]);
  });
});

describe('levels', () => {
  it('maps 0 to 0 and the max to 4 with quartiles in between', () => {
    expect(levels([0, 1, 2, 3, 4, 8])).toEqual([0, 1, 1, 2, 2, 4]);
  });
  it('all zeros stay zero', () => {
    expect(levels([0, 0])).toEqual([0, 0]);
  });
});

describe('requireRepo', () => {
  const data = {
    generatedAt: 'x',
    repos: { 'Guqin-AI': { commits: 1, firstCommit: 'a', lastCommit: 'b', weeklyCommits: [1], languages: [] } },
  };
  it('returns the repo', () => {
    expect(requireRepo(data, 'Guqin-AI').commits).toBe(1);
  });
  it('names the script when missing', () => {
    expect(() => requireRepo(data, 'Nope')).toThrow(/fetch-github\.mjs/);
  });
});

describe('formatCount', () => {
  it('rounds down to hundreds with a plus', () => {
    expect(formatCount(1246)).toBe('1,200+');
    expect(formatCount(17)).toBe('17');
    expect(formatCount(99)).toBe('99');
    expect(formatCount(150)).toBe('100+');
  });
});
