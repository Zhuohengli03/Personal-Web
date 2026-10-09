# Personal site redesign — design spec

Date: 2026-10-08
Repo: `Zhuohengli03/Personal-Web` (this working copy). Live at https://lizhuoheng.com via GitHub Pages (Actions build). Domain stays as is.

## 1. Goal and audience

A bilingual (EN default, ZH switch) personal site for job hunting in BA / DA / PM / Product roles. Readers are recruiters and hiring managers; the site must read like a well-set analyst report, not a developer playground.

The story the site tells: Xi'an Conservatory guqin performance (B.A.) → NYU M.S. Management and Analytics (GPA 3.92) → built a 1,200+ commit guqin notation SaaS (Guqin-AI). Domain depth + product judgement + data fluency.

Nothing on the site is invented. Facts come from the old site's content (experience, education, honors, contact) and the GitHub API. Anything not yet available is marked `[TODO: …]` and listed in `CONTENT-TODO.md`.

**Hard rule — the old design must not influence the new one.** The previous design (glassmorphism, fluid cursor, background video, sidebar layout, Tailwind utility styling, "magic" components) is not reused, adapted or consulted. During implementation nobody opens `astro-portfolio/src/**` or its CSS; the directory is deleted in the first implementation step, before any new code is written. The only things that carry over are (a) factual text already extracted into this spec and `profile.*.json`, and (b) raw screenshot files, which are copied as image assets and renamed. The sole design reference is the Inkling page in §2.

## 2. Reference and visual system

Reference: https://thinkingmachines.ai/inkling/ — centered editorial layout. Mapped tokens:

| Token | Value |
|---|---|
| `--bg` / `--fg` / `--fg-muted` | `#ffffff` / `#282828` / `#6b6866` (light). Dark: `#141414` / `#ededed` / `#9a9896`. Theme follows system, with a manual toggle persisted in `localStorage`. |
| `--accent` | `#0155bf` (links, active waffle cells, focus rings). Single accent only; in dark mode the same hue is lightened to `#5b9bff` for contrast. |
| Serif (display) | Newsreader (EN), Noto Serif SC (ZH) |
| Sans (body) | Inter (EN), Noto Sans SC (ZH) |
| Mono (eyebrows, labels) | JetBrains Mono, 0.75rem, letter-spacing 0.08em, uppercase for EN |
| Measure | Body text 44ch centered; wide blocks max 1000px; page gutter 1.25rem |
| Rhythm | Section gap 8rem (6rem under 640px); divider 80px × 1px at 35% opacity |
| Cards | 14px radius, background `color-mix(fg 3%, bg)`, hover 4.5%, padding 2rem |
| Motion | Hero children fade-up 0.7s with 0.1/0.18/0.26/0.34s delays; sections reveal on scroll (IntersectionObserver, translateY 40px → 0); all motion off under `prefers-reduced-motion` |

Fonts are self-hosted (woff2 in `public/fonts/`) with `font-display: swap`; Chinese fonts are subset to the glyphs used at build time (`subfont` or `glyphhanger` in a script) to keep the ZH bundle small. If subsetting proves fragile, fall back to Google Fonts `<link>` with `display=swap`.

## 3. Pages and routes

```
/                         Home (EN)         /zh/                         Home (ZH)
/work/guqin-ai/           Case study        /zh/work/guqin-ai/
/work/dad-market-forecast/                  /zh/work/dad-market-forecast/
/resume.pdf               [TODO] placeholder PDF until the real one is supplied
/404.html
```

Language switch links to the same path under the other locale. `<html lang>` and `hreflang` alternates are set on every page. Trailing slashes everywhere (Pages-friendly).

### 3.1 Home sections (in order)

1. **Hero** — eyebrow (mono): `Zhuoheng Li · M.S. Management & Analytics, NYU`; serif title, one sentence positioning; 44ch subtitle; CTA row: `Résumé` (primary, → `/resume.pdf`), `Email` (secondary, → `mailto:zhuohengli03@gmail.com`).
2. **Stats row** — four label/value pairs: `GPA 3.92 / 4.00`, `1,200+ commits · Lingxian`, `94 Lingxian beta users`, `4 live sites shipped` (lingxian.app, lzhpw.com, web-designer-lac.vercel.app, qinghua-deep-evol.vercel.app). Values that come from GitHub are read from `src/data/github.json`.
3. **Selected work** — two large `WorkCard`s (Lingxian / Guqin-AI, DaD-Market-Forecast): serif title + badge (`Product` / `Data`), 2–3 line body, spec grid (Role · Period · Stack · Scale), a `Waffle` visual, link row (`Case study →`, `GitHub` when public, `Live site ↗` → https://lingxian.app for Guqin-AI). The product is publicly named **Lingxian (灵弦)**; the repo name Guqin-AI appears only as the slug.
   - Guqin-AI waffle: one cell per week since 2026-02-12, filled by commits that week (bucketed from `github.json`).
   - DaD: no waffle. The grid is only drawn from real commit data (`github.json`); DaD's 17 commits over three weeks would not make a meaningful grid, and a decorative pattern would read as data.
4. **Analytics** — three-column `FeatureGrid` using the old site's three non-GitHub analyses, rewritten as *Question → Method → Output*: E-commerce user & marketing analytics (KPI system, cohort, RFM + K-means); Operations & product-selection analytics (metric framework, daily briefs); Social networks & starting salary (survey cleaning, group comparison). Each may link to screenshots carried over from the old repo.
5. **More projects** — three `ProjectMini` cards: Dynamic Web Crawler (GitHub), Meteor Madness — NASA Space Apps 2025 (GitHub, "Led the Prediction module"), WebDesigner / DeepEvol client sites (live Vercel link, labelled "client work"; repos stay private).
6. **Experience** — `Timeline` with one entry: Luoyang Shangxian Technology — Data Analyst Intern, 2025.06–2025.08, five bullets from the old site.
7. **Education & honors** — two `EducationCard`s: NYU (M.S. Management & Analytics, Business Analytics, 2025.09–2026.12 expected, GPA 3.83/4.00); Xi'an Conservatory of Music (B.M. Music Performance, Guqin, 2021.09–2025.07) with the nine honors in a `<details>` list.
8. **Contact / footer** — email, LinkedIn (`[TODO: url]`), GitHub `Zhuohengli03`, language switch, © year. (The theme toggle lives in the header only.)

### 3.2 Case study page (`CaseLayout`)

Header: eyebrow (category · period) → serif title → one-sentence summary → spec grid (Role, Period, Stack, Scale, Links). Body sections, each an `h2` with a mono numbered eyebrow (`01 Problem`, `02 Decisions`, `03 Result`, `04 Gallery`):

- **Problem** — the user problem in plain language (Guqin-AI: the three pains of notating guqin music; DaD: deciding when to buy/sell on a volatile in-game market).
- **Decisions** — 3–4 product/engineering decisions, each with *why*.
- **Result** — feature list + engineering data (Guqin-AI: commits, active months, monorepo packages, stack; DaD: data volume, models, forecast horizon). Uses `Waffle` and `SpecRow`.
- **Gallery** — responsive grid of images from `src/assets/work/<slug>/` (so `astro:assets` can resize and convert to WebP); Lingxian uses screenshots taken from the live site https://lingxian.app; DaD uses the `game-market` screenshots carried over (renamed `01.png`…). Images lazy-load; click opens native `<dialog>` lightbox (small inline script).
- **Links** — GitHub (if public), Live site (Lingxian → https://lingxian.app), back to home.

## 4. Content model

```
site/
  src/content/projects/en/guqin-ai.md          frontmatter + case study body
  src/content/projects/en/dad-market-forecast.md
  src/content/projects/zh/…                    same slugs
  src/content/config.ts                        zod schema (see below)
  src/i18n/en.json, zh.json                    UI strings
  src/i18n/index.ts                            t(locale, key), getAltPath()
  src/data/profile.en.json, profile.zh.json    experience, education, honors, analytics, mini projects, contact
  src/data/github.json                         generated: per-repo {commits, firstCommit, lastCommit, weeklyCommits[], languages}
scripts/fetch-github.mjs                       refreshes github.json via `gh api` (run manually; committed output)
site/scripts/shoot.mjs                         Playwright screenshots of the live sites into src/assets/
CONTENT-TODO.md                                every [TODO] with where it lives
```

Project frontmatter schema: `title, summary, category ('product'|'data'), role, period, stack: string[], scale: string[], links: {github?, demo?, live?}, featured: boolean, waffle?: {cols, cells: number[]}, order`.

GitHub data is fetched at development time only (owner token, covers private repos), committed as JSON, and read at build. No client-side API calls.

## 5. Components (all `.astro`, no client framework)

`BaseLayout` (head, fonts, theme init, header, footer, scroll-reveal script) · `SiteHeader` (wordmark, anchors, language switch, theme toggle) · `Hero` · `SpecRow` · `WorkCard` · `Waffle` · `FeatureGrid` · `ProjectMini` · `Timeline` · `EducationCard` · `Footer` · `CaseLayout` · `Gallery` · `Lightbox`.

Client JS, total < 3 KB: theme toggle (reads/writes `localStorage`, guarded in try/catch), IntersectionObserver reveal, `<dialog>` lightbox. Each is an inline module in its component; no bundler-level framework.

## 6. Repo layout and deployment

- New Astro 5 project in `site/`. `astro-portfolio/` is deleted in the same change (history keeps it). Screenshots worth keeping move to `site/public/work/<slug>/` and `site/public/analytics/<slug>/` with short names; `background/`, `photography/`, Supabase code and the admin area are dropped.
- `.github/workflows/deploy-astro.yml` → `deploy.yml`: `working-directory: site`, artifact `site/dist`, drop the Supabase env vars. Trigger: push to `main` + `workflow_dispatch`.
- `astro.config.mjs`: `site: 'https://lizhuoheng.com'`, `trailingSlash: 'always'`, `i18n: { defaultLocale: 'en', locales: ['en','zh'], routing: { prefixDefaultLocale: false } }`, sitemap integration.
- `public/CNAME` containing `lizhuoheng.com` so the custom domain survives Actions deploys.
- `.gitignore` updated for `site/node_modules`, `site/dist`, `site/.astro`.

## 7. Error handling and edge cases

- Missing `github.json` or a repo missing from it → build fails loudly with a message pointing at `scripts/fetch-github.mjs` (never silently render zeros).
- A project present in `en/` but missing in `zh/` (or vice versa) → `astro check` + a small build-time assertion in `content/config.ts` loader fails the build.
- Images referenced in a gallery that don't exist → build-time assertion.
- `localStorage` unavailable → theme follows system only.
- JS disabled → everything is visible (reveal classes default to visible without JS via `html.no-js`).

## 8. Testing and acceptance

- `npm run build` and `npx astro check` pass with zero errors.
- Playwright (`site/tests/`): for each of `/`, `/zh/`, two case pages ×2 locales: page loads, `<html lang>` correct, no console errors, every internal link resolves (crawl `dist/`), language switch lands on the mirrored path, theme toggle flips `data-theme`, reduced-motion disables animations. Run against `astro preview`.
- i18n completeness test: every key in `en.json` exists in `zh.json` and vice versa; every `en` project has a `zh` twin.
- Lighthouse (CI optional, local required before first push): Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95 on `/` and one case page, mobile preset.
- Manual: 390px, 768px, 1280px screenshots reviewed; no horizontal scroll.

## 9. Materials pipeline (screenshots and project data)

The owner has asked that project materials be produced by running the repos, not requested from them. Only when a repo genuinely cannot be run (missing secrets, paid services, hardware) is a request made, and it is logged in `CONTENT-TODO.md` with what was tried.

| Project | Source of images | Plan |
|---|---|---|
| Lingxian (Guqin-AI) | live site https://lingxian.app | Playwright screenshots at 1440×900 of: `/en` landing hero, `/editor` with a few notes entered, `/zhifa` fingering reference, `/pricing`, `/blog`. Target 5–7 images. No local setup needed. If the live site is down, fall back to running the repo locally (Postgres 15 is installed; minimum env: `AUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST=true`). |
| DaD-Market-Forecast | old repo screenshots (`game-market/`, 10 files) | copy, rename `01.png`…, write captions from what each shows. Optionally re-run `main.py` for a fresh forecast chart if deps install cleanly. |
| Crawler | old repo screenshots (6) | copy, rename, caption. |
| Meteor Madness | old repo screenshots (`nasa-space-apps/`, 2 usable) | copy, rename. Mini cards show no images, so two is enough. |
| WebDesigner, DeepEvol | live sites https://web-designer-lac.vercel.app, https://qinghua-deep-evol.vercel.app | one hero screenshot each. Fallback: run locally (`npm i && npm run dev`). |
| Xingyuanguzheng | live site https://www.lzhpw.com | no screenshot; it is named in the "4 live sites" stat hint only. |
| E-commerce / Operations analytics | old repo screenshots | copy, rename, caption; crop anything that exposes personal data. |

Screenshot rules: 1440×900 viewport, device scale 2, PNG → converted to WebP (≤ 300 KB each) at build via `astro:assets`. No personal data, tokens or local paths visible; crop or blur if needed. Each image gets an `alt` and a caption in both locales. `site/scripts/shoot.mjs` (Playwright, run from `site/`) records the URL list per project so the set can be regenerated.

The résumé PDF and LinkedIn URL are the only items that cannot be produced by running anything; both stay `[TODO]` until supplied.

## 10. Out of scope

Public Guqin-AI demo deployment (separate task; placeholder only). Blog, guestbook, photography, admin backend from the old site. Analytics/tracking scripts (none added).
