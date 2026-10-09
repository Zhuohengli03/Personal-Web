export function slugOf(entry: { id: string }): string {
  return entry.id.replace(/^(en|zh)\//, '');
}

/** Ids like "en/x" / "zh/x"; returns ids whose twin in the other locale is missing. */
export function findUnpaired(ids: string[]): string[] {
  const set = new Set(ids);
  return ids.filter((id) => {
    const [loc, ...rest] = id.split('/');
    const twin = `${loc === 'en' ? 'zh' : 'en'}/${rest.join('/')}`;
    return !set.has(twin);
  });
}
