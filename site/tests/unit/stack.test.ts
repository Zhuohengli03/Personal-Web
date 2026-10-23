import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildStack, unclaimed, stackData } from '../../src/lib/stack';

// The same stack lists the home page reads, taken straight from the English case-study frontmatter.
const dir = join(process.cwd(), 'src/content/projects/en');
const projects = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
  const line = readFileSync(join(dir, f), 'utf8').match(/^stack:\s*(\[.*\])\s*$/m);
  return { slug: f.replace(/\.md$/, ''), stack: JSON.parse(line![1]) as string[] };
});

describe('stack section', () => {
  for (const locale of ['en', 'zh'] as const) {
    it(`every listed tool has at least one project behind it (${locale})`, () => {
      const empty = buildStack(projects, locale).flatMap((g) => g.tools).filter((t) => t.evidence.length === 0).map((t) => t.name);
      expect(empty).toEqual([]);
    });
  }
  it('every stack entry of every case is claimed by a tool or deliberately ignored', () => {
    expect(unclaimed(projects)).toEqual([]);
  });
  it('every case has a short name in both languages', () => {
    for (const p of projects) {
      expect(stackData.projects[p.slug]?.en, p.slug).toBeTruthy();
      expect(stackData.projects[p.slug]?.zh, p.slug).toBeTruthy();
    }
  });
  it('matches by meaning, not by substring accidents', () => {
    const tools = Object.fromEntries(buildStack(projects, 'en').flatMap((g) => g.tools).map((t) => [t.name, t.evidence.map((e) => e.slug ?? 'site')]));
    expect(tools['Java']).toEqual(['meteor-madness']);          // not "JavaScript"
    expect(tools['Public data APIs']).toEqual(['dad-market-forecast', 'meteor-madness']); // not FastAPI
    expect(tools['FastAPI']).toEqual(['dad-market-forecast']);
    expect(tools['Python']).toContain('checking-acquisition-targeting');
  });
});
