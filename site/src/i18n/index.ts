import en from './en.json';
import zh from './zh.json';

export type Locale = 'en' | 'zh';
export const locales: Locale[] = ['en', 'zh'];
const dict: Record<Locale, unknown> = { en, zh };

/** Localize date-only content without timezone conversion or adding unknown days. */
export function formatDate(value: string, locale: Locale): string {
  if (locale === 'en') return value;
  const date = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!date) return value;
  return `${date[1]} 年 ${Number(date[2])} 月${date[3] ? ` ${Number(date[3])} 日` : ''}`;
}

function lookup(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function t(locale: Locale): (key: string) => string {
  return (key) => {
    const v = lookup(dict[locale], key);
    if (typeof v !== 'string') throw new Error(`i18n: missing key "${key}" for locale "${locale}"`);
    return v;
  };
}

/** Flat list of dot-path keys present in `a` but absent in `b`. */
export function missingKeys(a: object, b: object, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(a)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const other = (b as Record<string, unknown>)[k];
    if (v && typeof v === 'object') {
      if (!other || typeof other !== 'object') out.push(key);
      else out.push(...missingKeys(v as object, other as object, key));
    } else if (other === undefined) out.push(key);
  }
  return out;
}

/** Strip a leading /zh so callers work with locale-less paths. */
export function stripLocale(path: string): string {
  return path.replace(/^\/zh(?=\/|$)/, '') || '/';
}

export function localePath(path: string, locale: Locale): string {
  const bare = stripLocale(path);
  return locale === 'zh' ? `/zh${bare}` : bare;
}

export function altPath(path: string, locale: Locale): string {
  return localePath(path, locale === 'zh' ? 'en' : 'zh');
}
