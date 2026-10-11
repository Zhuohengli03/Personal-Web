# Content to-do

Items that only the site owner can supply. Everything else on the site is sourced from GitHub, the live products or the old site's factual text.

| Item | Where | How to replace |
|---|---|---|
| Résumé PDFs | `site/public/resume-en.pdf` (EN page) and `site/public/resume-zh.pdf` (ZH page) — both placeholders | Overwrite with the real PDFs, **without phone numbers** (the site is public and gets scraped); keep the names. |
| Guqin photos (performances, the Youlan·Yangchun competition, practice) | `site/src/assets/life/guqin/` | Drop JPG/PNG files there, then add one entry per photo to `photos` in `site/src/data/life.en.json` and `life.zh.json` (`"file": "guqin/<name>.jpg", "hobby": "guqin", "caption": "…"`). The Guqin card becomes a filter automatically. |
| Game cards and the games page | `site/src/data/life.*.json` → the games hobby's `cards` (played a lot: title, hours/rank, Steam link, cover) and `page.cards` (also played, genre only) rendered at `/life/games/` | Covers are Steam store library art (`library_600x900.jpg`) saved to `site/src/assets/life/games/`; Wardogs uses its Steam capsule cropped to portrait. Hours come from the owner's résumé — update both locales together. |
| Cooking photos (optional) | `site/src/assets/life/cooking/` | Same as the guqin row with `"hobby": "cooking"`. |
| Photo captions | `site/src/data/life.*.json` → `photos[].caption` | 16 travel photos carry draft captions; add confirmed places and years in both languages. English captions retain `[TODO: …]` markers; Chinese captions show only the available descriptions, with unconfirmed details omitted. Both locales list the same files in the same order (a unit test enforces it). |
| Hobby blurbs | `site/src/data/life.*.json` → `hobbies[].blurb` | Cooking, games and swimming have neutral one-liners; rewrite freely. |

Done: LinkedIn URL is in `profile.*.json` → `contact.linkedin` and renders in the footer. Profile photo is in `site/src/assets/photo.jpg`. Résumés without phone numbers are in `site/public/resume-{en,zh}.pdf`.

## Numbers that change

| Number | Where it lives | Shown |
|---|---|---|
| Lingxian users / scores / PDF exports / week-2 retention + `asOf` | `site/src/data/metrics.json` (one place, both languages) | stats row on the home page, always with "as of {asOf}" |
| DaD exhibit data (Season 10 Cobalt Ore holdout: hourly actual / forecast / naive / 90% interval, daily windows, metrics) | `site/src/data/figures/dad.json` → `cd site && node scripts/dad-figures.mjs ~/Cursor/Darker\ Market/data/runs/holdout/<run>.json` (the project's holdout run JSON stays local; the case prose quotes the same numbers — update both together) | three SVG exhibits + stat strip on the DaD case page |
| Product-selection exhibit data (daily units and stock-outs, best-selling listing's price / rank / units, per-listing ad spend and ACoS) | `site/src/data/figures/ops.json` → `cd site && node scripts/ops-figures.mjs "<folder with the five amazon_sales_*.csv exports>"` (the exports stay local in iCloud; only aggregates are written; captions in `ops-text.json` and the case prose quote the same numbers — update together) | five exhibits + stat strip on the product-selection case page |
| User & marketing exhibit data (click rate and viewer mix per price band, five K-means segments of clicking users) | `site/src/data/figures/ums.json` → `cd site && node scripts/ums-figures.mjs "<folder with ad.csv, click.csv, user.csv>"` (the three tables stay local in iCloud; only aggregates are written; the clustering is seeded, so the output is reproducible; captions in `ums-text.json` and the case prose quote the same numbers — update together) | five exhibits + stat strip on the user & marketing case page |
| Page-view analytics | GitHub Actions variable `PUBLIC_UMAMI_WEBSITE_ID` (website id from https://cloud.umami.is/ after adding lizhuoheng.com there) — unset until the owner creates the account | the `<script>` beacon in `BaseLayout.astro`; absent from local, preview and e2e builds |
| Web-crawler exhibit data (one instrumented run of the tool's scroll loop and detail extraction on juejin.cn: per-round counts, fill rates, inferred schema) | `site/src/data/figures/crawler.json` → `<python with streamlit+selenium> site/scripts/crawler-run.py ~/Cursor/Crawler_c --need 60` (needs Microsoft Edge; Selenium Manager fetches the driver; takes ~7 minutes; no page content is written; captions in `crawler-text.json` and the case prose quote the same numbers — update together) | four exhibits + stat strip on the web-crawler case page; UI screenshots in `site/src/assets/work/web-crawler/` were taken from the running Streamlit app; the recording `site/public/work/web-crawler/run.gif` comes from `node scripts/crawler-record.mjs http://localhost:8512/ <frames dir> <msedgedriver path> 40` against the running app, then `python3 -I scripts/crawler-gif.py <frames dir> public/work/web-crawler/run.gif 960` |
| Meteor Madness exhibit data (physics sweep via the app's own functions, one pull of close approaches / fireballs / NEO feed through the project's Java backend) | `site/src/data/figures/meteor.json` → run the project (`~/Cursor/Hackthon/Hackthon-Meteror/Hackthon-Meteror`, JDK 17, `mvn compile`, start `WebServer` on :8080), save `/api/close-approaches?limit=200&distMax=0.05`, `/api/fireballs?sinceDate=2015-01-01&limit=500`, `/api/neo-feed` to a folder, then `node scripts/meteor-shoot.mjs http://localhost:8080/ src/assets/work/meteor-madness <folder>` (screenshots + sweep.json) and `node scripts/meteor-figures.mjs <folder>`; captions in `meteor-text.json` and the case prose quote the same numbers — update together | four exhibits + stat strip + six screenshots on the Meteor Madness case page |
| Commit count | `site/src/data/github.json` → `node scripts/fetch-github.mjs` | rounded ("1,200+") in the terminal panel and stats row |
| Exact figures in the Lingxian case study prose (94 / 160 / 144 / 20.7% / 53% → 35% / 96% …) | `site/src/content/projects/{en,zh}/guqin-ai.md` | with "as of September 2026" in the text — update the prose and the date together |

The hero copy and the terminal panel deliberately carry no volatile numbers.

Refresh commands: `node scripts/fetch-github.mjs` (activity data), `cd site && node scripts/shoot.mjs` (live-site screenshots), `cd site && node scripts/audit.mjs` (responsive snapshots + Lighthouse into `site/audit-results/`).

The old site's screenshots for the crawler, NASA, e-commerce and operations projects are still in git history (commit `6fa2141`, under `site/src/assets/projects/` and `site/src/assets/analytics/`) if a later version adds galleries to those cards.
