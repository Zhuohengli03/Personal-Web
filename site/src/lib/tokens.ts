import metrics from '../data/metrics.json';
import { formatDate, type Locale } from '../i18n';
import { formatCount, requireRepo, type GithubData } from './github';

export type TokenValues = Record<string, string | number>;

/** Replace `{name}` / `{group.name}` placeholders; an unknown token is a build error, never silent text. */
export function fill(template: string, values: TokenValues): string {
  return template.replace(/\{([\w.]+)\}/g, (_, key: string) => {
    const v = values[key];
    if (v === undefined) throw new Error(`unknown token "{${key}}" in "${template}"`);
    return String(v);
  });
}

/** Flatten `{ lingxian: { users: 94 } }` into `{ "lingxian.users": 94 }`. */
export function flatten(obj: Record<string, unknown>, prefix = ''): TokenValues {
  return Object.entries(obj).reduce<TokenValues>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' ? { ...acc, ...flatten(v as Record<string, unknown>, key) } : { ...acc, [key]: v as string | number };
  }, {});
}

/** All tokens the site may use: volatile product metrics (metrics.json) plus GitHub activity for one repo. */
export function siteTokens(github: GithubData, repo: string, locale: Locale = 'en'): TokenValues {
  const r = requireRepo(github, repo);
  return {
    ...flatten(metrics as Record<string, unknown>),
    'lingxian.asOf': formatDate(metrics.lingxian.asOf, locale),
    commits: formatCount(r.commits), // rounded: "1,200+" — the exact number changes with every push
    commitsExact: r.commits.toLocaleString('en-US'),
    lastCommit: formatDate(r.lastCommit, locale),
  };
}
