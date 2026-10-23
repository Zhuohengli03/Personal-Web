// The home page's stack section: every tool is listed with the projects that use it, drawn from the `stack`
// field of each English case-study entry (plus this site, whose stack is not a case). A tool without
// evidence is not shown — the unit test fails instead, so the list can only claim what a project shows.
import raw from '../data/stack.json';
import type { Locale } from '../i18n';

type Text = string | { en: string; zh: string };
export interface StackData {
  projects: Record<string, { en: string; zh: string }>;
  site: { en: string; zh: string; href: string };
  ignore: string[];
  groups: { label: { en: string; zh: string }; tools: { name: Text; match?: string; site?: boolean }[] }[];
}
export interface ProjectStack { slug: string; stack: string[] }
export interface Evidence { label: string; slug?: string; href?: string }
export interface StackGroup { label: string; tools: { name: string; evidence: Evidence[] }[] }

export const stackData = raw as StackData;
const text = (t: Text, locale: Locale) => (typeof t === 'string' ? t : t[locale]);

/** Tools with the projects (in the given order) whose stack mentions them. */
export function buildStack(projects: ProjectStack[], locale: Locale, data: StackData = stackData): StackGroup[] {
  return data.groups.map((g) => ({
    label: g.label[locale],
    tools: g.tools.map((tool) => {
      const re = tool.match ? new RegExp(tool.match) : null;
      const evidence: Evidence[] = re
        ? projects.filter((p) => p.stack.some((s) => re.test(s))).map((p) => ({ label: data.projects[p.slug]?.[locale] ?? p.slug, slug: p.slug }))
        : [];
      if (tool.site) evidence.push({ label: data.site[locale], href: data.site.href });
      return { name: text(tool.name, locale), evidence };
    }),
  }));
}

/** Stack entries that no tool claims and that are not on the ignore list — they should be added to stack.json. */
export function unclaimed(projects: ProjectStack[], data: StackData = stackData): string[] {
  const res = data.groups.flatMap((g) => g.tools).filter((t) => t.match).map((t) => new RegExp(t.match!));
  const ign = data.ignore.map((p) => new RegExp(p));
  return projects.flatMap((p) => p.stack.filter((s) => !res.some((r) => r.test(s)) && !ign.some((r) => r.test(s))).map((s) => `${p.slug}: ${s}`));
}
