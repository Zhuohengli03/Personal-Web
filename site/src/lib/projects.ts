import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';
import { findUnpaired } from './pairing';
export { slugOf, findUnpaired } from './pairing';

export async function getProjects(locale: Locale): Promise<CollectionEntry<'projects'>[]> {
  const all = await getCollection('projects');
  const orphans = findUnpaired(all.map((e) => e.id));
  if (orphans.length) {
    throw new Error(
      `projects: missing locale twin for ${orphans.join(', ')} — every en/*.md needs a zh/*.md with the same name`,
    );
  }
  return all.filter((e) => e.id.startsWith(`${locale}/`)).sort((a, b) => a.data.order - b.data.order);
}
