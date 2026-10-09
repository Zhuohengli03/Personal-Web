# Content to-do

Items that only the site owner can supply. Everything else on the site is sourced from GitHub, the live products or the old site's factual text.

| Item | Where | How to replace |
|---|---|---|
| Résumé PDF | `site/public/resume.pdf` (placeholder one-pager) | Overwrite the file with the real PDF; keep the name. |
| LinkedIn URL | `site/src/components/Footer.astro` (`footer.linkedinTodo` text) and `site/src/data/profile.*.json` → `contact.linkedin` | Add `"linkedin": "https://www.linkedin.com/in/…"` to both profile files, then in `Footer.astro` render `<a href={profile.contact.linkedin}>LinkedIn</a>` when present. |

Refresh commands: `node scripts/fetch-github.mjs` (activity data), `cd site && node scripts/shoot.mjs` (live-site screenshots).
