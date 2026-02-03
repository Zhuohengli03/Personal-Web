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
│   └── pages/
│       ├── index.astro     # Home (about, skills, featured projects)
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
- **Projects**: list + per-project pages from Markdown.  
- **Resume**: PDF embed + download.  
- **Code**: Python, SQL, Bash (and more) via Shiki.  
- **Scale**: add projects/articles by adding Markdown; blog collection ready when you need it.  
- **Deploy**: static build → GitHub Pages via the provided workflow.
