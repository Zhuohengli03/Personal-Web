# Content to-do

Items that only the site owner can supply. Everything else on the site is sourced from GitHub, the live products or the old site's factual text.

| Item | Where | How to replace |
|---|---|---|
| Résumé PDFs | `site/public/resume-en.pdf` (EN page) and `site/public/resume-zh.pdf` (ZH page) — both placeholders | Overwrite with the real PDFs, **without phone numbers** (the site is public and gets scraped); keep the names. |
| Profile photo for the hanging badge | `site/src/assets/photo.jpg` | Drop a front-facing photo there; the badge component crops it. |

Done: LinkedIn URL is in `profile.*.json` → `contact.linkedin` and renders in the footer.

Refresh commands: `node scripts/fetch-github.mjs` (activity data), `cd site && node scripts/shoot.mjs` (live-site screenshots), `cd site && node scripts/audit.mjs` (responsive snapshots + Lighthouse into `site/audit-results/`).

The old site's screenshots for the crawler, NASA, e-commerce and operations projects are still in git history (commit `6fa2141`, under `site/src/assets/projects/` and `site/src/assets/analytics/`) if a later version adds galleries to those cards.
