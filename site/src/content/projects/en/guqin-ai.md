---
title: "Lingxian — online jianzipu editor for the guqin"
summary: "A notation editor and small SaaS for guqin players: type a fingering, see tablature and staff notation written together; compare versions, co-edit with a teacher, export a printable book."
category: product
role: "Founder, product and engineering — solo"
period: "2026.02 – present"
stack: ["Next.js 14", "React 18", "TypeScript", "Prisma + PostgreSQL", "VexFlow", "Zustand", "Auth.js", "Stripe", "WebSocket + Yjs", "pnpm monorepo"]
scale: ["1,200+ commits", "3 apps (web, api, mobile) + shared package", "ZH + EN site", "Live at lingxian.app"]
links: { live: "https://lingxian.app" }
featured: true
order: 1
waffle: { source: github, repo: Guqin-AI }
gallery:
  - { src: "../../../assets/work/guqin-ai/01.png", alt: "Lingxian landing page: the product name over a photograph of a guqin, with a floating editor demo showing staff notation and jianzipu side by side", caption: "Landing page (EN): type a fingering and the tablature and staff notation are written together. Free to start, nothing to install, 11 tunings." }
  - { src: "../../../assets/work/guqin-ai/02.png", alt: "Feature section 'Entering jianzipu' with a screenshot of the editor rendering a full score of Guan Shan Yue", caption: "Section 01 of the landing page: the score takes shape as you type — fingering panel on the left, laid-out score with staff and jianzipu on the right." }
  - { src: "../../../assets/work/guqin-ai/03.png", alt: "The editor on first open: duration, technique, hui and string panels on the left, a five-step guide in the middle, score refinement tools on the right", caption: "The editor on first open, with its five-step guide: every note is built from string, hui, fen and technique rather than drawn." }
  - { src: "../../../assets/work/guqin-ai/04.png", alt: "Fingering reference index page listing 149 techniques with search by character or pinyin and category filters", caption: "指法大全 — a public reference of 149 fingerings, searchable by character or pinyin and filterable by hand and technique family." }
  - { src: "../../../assets/work/guqin-ai/05.png", alt: "Pricing page with a free Basic tier and a Pro tier at ¥12 per month, monthly/yearly toggle", caption: "Pricing: the editor is free; Pro (¥12/month) unlocks textbook editing, version comparison and multi-score collaboration." }
  - { src: "../../../assets/work/guqin-ai/06.png", alt: "Blog index titled 琴学札记 with 64 articles across eight categories and a search box", caption: "琴学札记 — the blog used for SEO: 64 articles across eight categories, from notation basics to intangible heritage." }
---

## Problem

Guqin tablature (*jianzipu*) tells you which string, which position and which finger — but not rhythm, tempo or weight. Players decide those phrase by phrase, and the decisions live only in their memory. Three things go wrong:

1. **Decisions are lost.** Where to break a phrase, where to slow down: you settle it line by line, but the notation can't record it. Months later you reopen the score and can't remember why you chose what you chose.
2. **Versions are opaque.** A piece goes through several revisions, each saved as a new file. Finding which version changed which note means laying two printouts side by side.
3. **Feedback is messy.** You send a score to your teacher; they screenshot it, circle things in red, send it back. Three rounds later nobody can say which version or symbol is being discussed.

I know these pains first-hand from four years as a performance major. No existing tool treated jianzipu as structured data.

## Decisions

**Model the score as data, not as a drawing.** Every note is a `Token` (string, hui, fen, technique, duration, ornaments); sections and documents compose them. This single decision makes staff-notation rendering, version diffing, collaboration and PDF export all possible from one source of truth — and it is why pitch can be computed from string + position + tuning instead of being typed twice.

**Ship the editor free, charge for the workflow.** The core editor is free so that first-time digital notators have no barrier. The paid tier (Pro) covers what regular setters and teachers need: textbook assembly, version comparison, multi-score collaboration. Pricing was decided before the payment code was written, so the feature boundaries were clear.

**Follow the hand, not the panel.** Ornaments that continue from the previous note (上/下/掐起/掩) take their string from the note that is actually being held, not from whatever the side panel says. It sounds like a detail; it is the difference between a tool that musicians trust and one they correct constantly.

**Two markets, one codebase.** Chinese and English sites share routes and components with hreflang pairing. WeChat/QQ login, Alipay/WeChat Pay and SMS codes for China; Google login and Stripe elsewhere.

## Result

A live product at lingxian.app with: tablature + staff + jianpu rendered together as you type; four page layouts switchable at any time; jianpu → jianzipu conversion with per-note alternatives; side-by-side version diff with color-coded changes; real-time co-editing with per-user cursors and comments; textbook assembly and print-ready PDF export; a browser tuner; a fingering reference of 149 techniques (指法大全) and a blog for SEO (64 articles in Chinese, 29 of them also in English).

Engineering footprint: 1,200+ commits since February 2026 (see the activity grid), a pnpm/turbo monorepo with web, api and mobile apps plus a shared music-theory package, Prisma migrations, Vitest, Docker images published to GHCR behind nginx.
