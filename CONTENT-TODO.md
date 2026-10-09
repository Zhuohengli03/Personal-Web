# Content to-do

Items that only the site owner can supply. Everything else on the site is sourced from GitHub, the live products or the old site's factual text.

| Item | Where | How to replace |
|---|---|---|
| Résumé PDF | `site/public/resume.pdf` (placeholder one-pager) | Overwrite the file with the real PDF; keep the name. |
| LinkedIn URL | `site/src/data/profile.en.json` and `profile.zh.json` → `contact.linkedin` | Add `"linkedin": "https://www.linkedin.com/in/…"` to `contact` in both files; the footer renders the link automatically. |

Refresh commands: `node scripts/fetch-github.mjs` (activity data), `cd site && node scripts/shoot.mjs` (live-site screenshots), `cd site && node scripts/audit.mjs` (responsive snapshots + Lighthouse into `site/audit-results/`).

The old site's screenshots for the crawler, NASA, e-commerce and operations projects are still in git history (commit `6fa2141`, under `site/src/assets/projects/` and `site/src/assets/analytics/`) if a later version adds galleries to those cards.
