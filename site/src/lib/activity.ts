import type { Locale } from '../i18n';
import { t, formatDate } from '../i18n';
import { levels, requireRepo, type GithubData, type Level } from './github';

export interface Activity { cells: Level[]; cols: number; label: string }

/** Weekly commit grid for a repo, with a localized accessible label. */
export function repoActivity(data: GithubData, repo: string, locale: Locale): Activity {
  const r = requireRepo(data, repo);
  const label = t(locale)('a11y.activity')
    .replace('{n}', r.commits.toLocaleString('en-US'))
    .replace('{from}', formatDate(r.firstCommit, locale))
    .replace('{to}', formatDate(r.lastCommit, locale));
  return { cells: levels(r.weeklyCommits), cols: 17, label };
}
