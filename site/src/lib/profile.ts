import { z } from 'zod';
import en from '../data/profile.en.json';
import zh from '../data/profile.zh.json';
import type { Locale } from '../i18n';

const stat = z.object({
  label: z.string(),
  value: z.string(),
  hint: z.string().optional(),
  source: z.enum(['static', 'github']).default('static'),
  repo: z.string().optional(),
});
const analytics = z.object({
  title: z.string(),
  question: z.string(),
  method: z.string(),
  output: z.string(),
  tags: z.array(z.string()).max(5),
});
const mini = z.object({
  title: z.string(),
  body: z.string(),
  period: z.string(),
  github: z.string().url().optional(),
  live: z.string().url().optional(),
  clientWork: z.boolean().default(false),
});
const experience = z.object({ company: z.string(), role: z.string(), period: z.string(), bullets: z.array(z.string()).min(1) });
const education = z.object({
  school: z.string(),
  degree: z.string(),
  period: z.string(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).default([]),
});

export const profileSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    terminal: z.object({
      title: z.string(),
      user: z.string(),
      command: z.string(),
      lines: z.array(z.object({ k: z.string(), v: z.string() })).min(3).max(8),
    }),
  }),
  stats: z.array(stat).length(4),
  analytics: z.array(analytics).length(3),
  miniProjects: z.array(mini).length(3),
  experience: z.array(experience).min(1),
  education: z.array(education).length(2),
  // strict: a `phone` or `wechat` key fails validation — no phone numbers on the public site
  contact: z.object({ email: z.string().email(), github: z.string(), linkedin: z.string().url().optional() }).strict(),
});
export type Profile = z.infer<typeof profileSchema>;

const raw: Record<Locale, unknown> = { en, zh };

export function loadProfile(locale: Locale): Profile {
  const r = profileSchema.safeParse(raw[locale]);
  if (!r.success) {
    const issues = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`profile.${locale}.json invalid: ${issues}`);
  }
  return r.data;
}
