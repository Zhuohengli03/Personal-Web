# Content to-do

Items that only the site owner can supply. Everything else on the site is sourced from GitHub, the live products or the old site's factual text.

| Item | Where | How to replace |
|---|---|---|
| Résumé PDFs | `site/public/resume-en.pdf` (EN page) and `site/public/resume-zh.pdf` (ZH page) — both placeholders | Overwrite with the real PDFs, **without phone numbers** (the site is public and gets scraped); keep the names. |
| Guqin photos (performances, the Youlan·Yangchun competition, practice) | `site/src/assets/life/guqin/` | Drop JPG/PNG files there, then add one entry per photo to `photos` in `site/src/data/life.en.json` and `life.zh.json` (`"file": "guqin/<name>.jpg", "hobby": "guqin", "caption": "…"`). The Guqin card becomes a filter automatically. |
| Cooking / games photos (optional) | `site/src/assets/life/cooking/`, `site/src/assets/life/games/` | Same as above with `"hobby": "cooking"` / `"games"`. |
| Photo captions | `site/src/data/life.*.json` → `photos[].caption` | 16 travel photos carry draft captions; add confirmed places and years in both languages. English captions retain `[TODO: …]` markers; Chinese captions show only the available descriptions, with unconfirmed details omitted. Both locales list the same files in the same order (a unit test enforces it). |
| Hobby blurbs | `site/src/data/life.*.json` → `hobbies[].blurb` | Cooking, games and swimming have neutral one-liners; rewrite freely. |

Done: LinkedIn URL is in `profile.*.json` → `contact.linkedin` and renders in the footer. Profile photo is in `site/src/assets/photo.jpg`. Résumés without phone numbers are in `site/public/resume-{en,zh}.pdf`.

## Numbers that change

| Number | Where it lives | Shown |
|---|---|---|
| Lingxian users / scores / PDF exports / week-2 retention + `asOf` | `site/src/data/metrics.json` (one place, both languages) | stats row on the home page, always with "as of {asOf}" |
| DaD exhibit data (Season 10 Cobalt Ore holdout: hourly actual / forecast / naive / 90% interval, daily windows, metrics) | `site/src/data/figures/dad.json` → `cd site && node scripts/dad-figures.mjs ~/Cursor/Darker\ Market/data/runs/holdout/<run>.json` (the project's holdout run JSON stays local; the case prose quotes the same numbers — update both together) | three SVG exhibits + stat strip on the DaD case page |
| Commit count | `site/src/data/github.json` → `node scripts/fetch-github.mjs` | rounded ("1,200+") in the terminal panel and stats row |
| Exact figures in the Lingxian case study prose (94 / 160 / 144 / 20.7% / 53% → 35% / 96% …) | `site/src/content/projects/{en,zh}/guqin-ai.md` | with "as of September 2026" in the text — update the prose and the date together |

The hero copy and the terminal panel deliberately carry no volatile numbers.

Refresh commands: `node scripts/fetch-github.mjs` (activity data), `cd site && node scripts/shoot.mjs` (live-site screenshots), `cd site && node scripts/audit.mjs` (responsive snapshots + Lighthouse into `site/audit-results/`).

The old site's screenshots for the crawler, NASA, e-commerce and operations projects are still in git history (commit `6fa2141`, under `site/src/assets/projects/` and `site/src/assets/analytics/`) if a later version adds galleries to those cards.
