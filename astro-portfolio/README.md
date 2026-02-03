# Astro Portfolio — Data / Analytics / Data Engineering

A **static**, content-first technical portfolio built with [Astro](https://astro.build). Optimized for data and analytics students: add projects by dropping Markdown files, embed your resume PDF, and deploy to GitHub Pages.

---

## Folder structure

```
astro-portfolio/
├── public/                 # Static assets (favicon, resume PDF)
│   ├── favicon.svg
│   └── resume.pdf          # Add your resume here
├── src/
│   ├── components/         # Reusable UI (ProjectCard, Skills)
│   ├── content/            # Content collections (Markdown)
│   │   ├── config.ts       # Schema for projects (and optional blog)
│   │   └── projects/       # One .md file per project
│   │       └── etl-pipeline.md
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   └── ProfileSidebar.astro  # Left sidebar: avatar, name, location, contact (hidden on Others page)
│   └── pages/
│       ├── index.astro     # Home (about, skills, featured projects)
│       ├── about.astro     # About + skills + education (with EducationCard)
│       ├── others.astro    # Others (photos etc.; no sidebar)
│       ├── projects/
│       │   ├── index.astro # Projects list
│       │   └── [slug].astro # Project detail (static paths from collection)
│       └── resume.astro    # PDF embed + download link
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Design choices (brief)

| Choice | Why |
|--------|-----|
| **Astro** | Zero/minimal JS by default, static by default, great DX. Fits “content-first” and “fully static for GitHub Pages.” |
| **Content collections** | Type-safe frontmatter (Zod), one source of truth per project. Adding a project = adding one Markdown file; no CMS. |
| **One project per Markdown file** | Easy to extend: duplicate an existing `.md`, edit frontmatter and body. No database or API. |
| **`getStaticPaths` from collection** | Project detail URLs (`/projects/etl-pipeline/`) are generated at build time from the collection. No client-side router. |
| **Resume page** | Single page that embeds `public/resume.pdf` in an iframe and offers a download link. Replace the file to update. |
| **Shiki for code blocks** | Astro’s built-in Markdown uses Shiki; Python, SQL, and Bash are supported. No extra integration. |
| **Blog collection in schema only** | `blog` is defined in `content/config.ts` with a schema; when you add a Blog section later, add `src/content/blog/*.md` and a page that uses `getCollection('blog')`. |
| **No heavy client framework** | Astro ships HTML + CSS; islands only if you add a framework later. Keeps the site fast and simple. |
| **Bilingual (zh / en)** | `content-zh` / `content-en` + `data-i18n` + `public/js/i18n.js`; language switcher in nav; `html[lang]` toggles visibility. |
| **Profile sidebar** | Left sticky sidebar (avatar, name, location, contact) on all pages except **Others**; hidden on small screens. |
| **Others page** | Nav item “其他” / “Others”; full-width layout (no sidebar) for photos and extra content. |

---

## Commands

```bash
cd astro-portfolio
npm install
npm run dev    # Dev server (e.g. http://localhost:4321)
npm run build  # Output to dist/
npm run preview # Preview dist/ locally
```

---

## Adding a project

1. Create a new `.md` file in `src/content/projects/` (e.g. `my-project.md`).
2. Use the same frontmatter shape as in the schema:

```yaml
---
title: My Project
description: One-line summary.
pubDate: 2025-02-01
featured: true
tech: [Python, SQL]
repo: https://github.com/you/repo
---
```

3. Write the body in Markdown (code blocks will be highlighted).
4. Rebuild; the project appears on the Projects page and gets its own detail page at `/projects/my-project/`.

---

## Editing content and translations

- **Navigation, section titles, buttons, page titles, resume copy, footer**  
  Edit **`public/js/i18n.js`**: `translations.zh` and `translations.en` must have matching keys; keep terminology consistent (e.g. 校园与志愿 / Campus & Volunteering).
- **Long-form bilingual content** (about, skills, experience, education, home page)  
  Edit the corresponding **`src/pages/*.astro`** files; use `content-zh` / `content-en` wrappers so the correct language shows by `html[lang]`.
- **Home page quotes**  
  Edit **`src/data/quotes.json`** (fields: `zh`, `authorZh`, `en`, `authorEn`).
- **Projects from Markdown**  
  Add or edit **`src/content/projects/*.md`**; project list and detail pages use this content.

---

## Resume

- Put your PDF at **`public/resume.pdf`**.
- The Resume page will embed it and show a “Download PDF” link.

---

## GitHub Pages deployment

1. **Repo settings**  
   In the repo: **Settings → Pages**  
   - Source: **GitHub Actions**.

2. **Build and deploy**  
   The workflow in **`.github/workflows/deploy-astro.yml`** (at the repo root) runs on push to `main`:
   - Installs dependencies in `astro-portfolio/`
   - Runs `npm run build`
   - Uploads `astro-portfolio/dist` as the Pages artifact and deploys.

3. **Base URL (optional)**  
   If the site is served at a **project** URL (e.g. `https://username.github.io/repo-name/`), set in `astro.config.mjs`:

   ```js
   base: '/repo-name/',
   site: 'https://username.github.io',
   ```

   For a **user/org** site (`https://username.github.io`), keep `base: '/'`.

4. **Lock file**  
   For reliable CI, run `npm install` inside `astro-portfolio/` once so `package-lock.json` exists; the workflow uses it for caching.


---

## Adding a blog later

1. Add Markdown files under `src/content/blog/` (schema already in `content/config.ts`).
2. Add `src/pages/blog/index.astro` that uses `getCollection('blog')`.
3. Add `src/pages/blog/[slug].astro` with `getStaticPaths` from the blog collection.
4. Link “Blog” in the layout nav.

---

## Summary

- **Home**: about, skills, featured projects.  
- **About**: combined about + skills + education (EducationCard for NYU / Xi'an Conservatory).  
- **Others**: “其他” / “Others” — full-width page for photos and more; no sidebar.  
- **Profile sidebar**: avatar, name, location, contact; sticky on the left (except on Others and on small screens).  
- **Projects**: list + per-project pages from Markdown.  
- **Resume**: PDF embed + download.  
- **i18n**: Chinese/English via `content-zh` / `content-en` and `data-i18n`; nav and page titles switch with language.  
- **Deploy**: static build → GitHub Pages via the provided workflow.
