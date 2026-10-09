import { z } from 'zod';
import en from '../data/life.en.json';
import zh from '../data/life.zh.json';
import type { Locale } from '../i18n';

const hobby = z.object({ id: z.string().regex(/^[a-z]+$/), title: z.string(), blurb: z.string() });
const photo = z.object({ file: z.string().regex(/^[a-z]+\/[\w-]+\.(jpg|jpeg|png|webp)$/), hobby: z.string(), caption: z.string() });

export const lifeSchema = z
  .object({ intro: z.string(), hobbies: z.array(hobby).min(1), photos: z.array(photo) })
  .superRefine((d, ctx) => {
    const ids = new Set(d.hobbies.map((h) => h.id));
    d.photos.forEach((p, i) => {
      if (!ids.has(p.hobby)) ctx.addIssue({ code: 'custom', path: ['photos', i, 'hobby'], message: `unknown hobby "${p.hobby}"` });
    });
  });
export type Life = z.infer<typeof lifeSchema>;

const raw: Record<Locale, unknown> = { en, zh };

export function loadLife(locale: Locale): Life {
  const r = lifeSchema.safeParse(raw[locale]);
  if (!r.success) {
    const issues = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`life.${locale}.json invalid: ${issues}`);
  }
  return r.data;
}

/** Both locales must describe the same photos in the same order, so the galleries mirror each other. */
export function lifeMismatch(a: Life, b: Life): string[] {
  const out: string[] = [];
  if (a.hobbies.length !== b.hobbies.length) out.push(`hobby count ${a.hobbies.length} vs ${b.hobbies.length}`);
  a.hobbies.forEach((h, i) => { if (b.hobbies[i]?.id !== h.id) out.push(`hobby ${i}: ${h.id} vs ${b.hobbies[i]?.id}`); });
  if (a.photos.length !== b.photos.length) out.push(`photo count ${a.photos.length} vs ${b.photos.length}`);
  a.photos.forEach((p, i) => { if (b.photos[i]?.file !== p.file) out.push(`photo ${i}: ${p.file} vs ${b.photos[i]?.file}`); });
  return out;
}
