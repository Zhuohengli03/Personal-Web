import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';
export { slugOf, findUnpaired } from './pairing';

/** Projects for one locale, ordered. Locale pairing is enforced by the collection loader in content.config.ts. */
export async function getProjects(locale: Locale): Promise<CollectionEntry<'projects'>[]> {
  const all = await getCollection('projects');
  return all.filter((e) => e.id.startsWith(`${locale}/`)).sort((a, b) => a.data.order - b.data.order);
}
