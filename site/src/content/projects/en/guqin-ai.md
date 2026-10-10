---
title: "Lingxian — online jianzipu editor for the guqin"
summary: "A notation editor and small SaaS for guqin players, built solo from February 2026 and now in invite-only beta: 94 registered users, 160 scores, 144 PDF exports and 20.7% week-2 retention (as of September 2026)."
category: product
role: "Founder — product, engineering (AI-assisted) and operations, solo"
period: "2026.02 – present"
stack: ["Next.js 14", "React 18", "TypeScript", "Prisma + PostgreSQL", "VexFlow", "Auth.js", "Qwen (LLM, intent only)", "WebSocket + Yjs", "pnpm monorepo"]
scale: ["94 users · 160 scores · 144 PDF exports (beta, 2026-09)", "20.7% week-2 retention (n=82)", "1,200+ commits", "ZH + EN site, live at lingxian.app"]
links: { live: "https://lingxian.app", github: "https://github.com/Zhuohengli03/lingxian" }
featured: true
order: 1
waffle: { source: github, repo: Guqin-AI }
gallery:
  - { src: "../../../assets/work/guqin-ai/01.png", alt: "Lingxian landing page: the product name over a photograph of a guqin, with a floating editor demo showing staff notation and jianzipu side by side", caption: "Landing page (EN): type a fingering and the tablature and staff notation are written together. Free to start, nothing to install, 11 tunings." }
  - { src: "../../../assets/work/guqin-ai/02.png", alt: "Feature section 'Entering jianzipu' with a screenshot of the editor rendering a full score of Guan Shan Yue", caption: "Section 01 of the landing page: the score takes shape as you type — fingering panel on the left, laid-out score with staff and jianzipu on the right." }
  - { src: "../../../assets/work/guqin-ai/03.png", alt: "The editor on first open: duration, technique, hui and string panels on the left, a five-step guide in the middle, score refinement tools on the right", caption: "The editor on first open, with its five-step guide: every note is built from string, hui, fen and technique rather than drawn." }
  - { src: "../../../assets/work/guqin-ai/04.png", alt: "Fingering reference index page listing 149 techniques with search by character or pinyin and category filters", caption: "指法大全 — a public reference of 149 fingerings, searchable by character or pinyin and filterable by hand and technique family." }
  - { src: "../../../assets/work/guqin-ai/05.png", alt: "Pricing page with a free Basic tier and a Pro tier at ¥12 per month, monthly/yearly toggle", caption: "Pricing: four tiers designed, two open online; no paid billing yet, so demand was validated with gifted plans." }
  - { src: "../../../assets/work/guqin-ai/06.png", alt: "Blog index titled 琴学札记 with 64 articles across eight categories and a search box", caption: "琴学札记 — the blog used for SEO: 64 articles across eight categories, from notation basics to intangible heritage." }
---

## Problem

Guqin players shared scores by hand-copying and phone photos. Tablature (*jianzipu*) tells you which string, which position and which finger — but not rhythm, tempo or weight. Players decide those phrase by phrase, and the decisions live only in their memory. Three things go wrong:

1. **Decisions are lost.** Where to break a phrase, where to slow down: you settle it line by line, but the notation can't record it. Months later you reopen the score and can't remember why you chose what you chose.
2. **Versions are opaque.** A piece goes through several revisions, each saved as a new file. Finding which version changed which note means laying two printouts side by side.
3. **Feedback is messy.** You send a score to your teacher; they screenshot it, circle things in red, send it back. Three rounds later nobody can say which version or symbol is being discussed.

I know these pains first-hand from four years as a performance major. No existing tool treated jianzipu as structured data, so I defined, built (with AI coding tools, Next.js + PostgreSQL) and launched one from scratch.

## Decisions

**Model the score as data, not as a drawing.** Every note is a `Token` (string, hui, fen, technique, duration, ornaments); sections and documents compose them. This single decision is what makes staff rendering, version diffing, collaboration, PDF export and — later — automatic transcription possible from one source of truth.

**Let sign-up applications write the roadmap.** I coded 119 sign-up applications into 10 need categories. 34 asked for the same thing: convert numbered notation (jianpu) into guqin notation automatically. I framed it as *candidate generation + ranking*: a rule engine enumerates every valid fingering, beam search picks the best-scoring sequence, and a candidate panel lets the player override. Every override is logged — ~3,800 edit events so far — as training data for a future ranking model.

**Measure the funnel one step at a time.** Sign-up → create → save → usable score → export, each counted separately. The largest loss was creators who never produced a usable score: 53% (30 of 57, mid-September). It matched the most common feedback, "input is too hard", so I shipped keyboard-style and batch input. The step now loses 35% (24 of 69) — no control group, so I report it as a before/after, not a causal effect.

**Chase the small leaks too.** Only 19 of 35 approved applicants (54%) redeemed their invites. The cause was a 2-day token expiry plus invites landing in spam; longer expiry and one-click resend fixed it.

**Price before you can charge.** I designed a four-tier plan structure and opened two tiers online, but paid billing is on hold until there is a Chinese business entity. To validate demand anyway I gifted plans: 2 sponsorships and 5 purchase-intent sign-ups on the pricing page.

**An AI assistant that cannot touch the score on its own (Jul 2026 →).** The in-editor assistant started as an answer-only chatbot. I rebuilt it as a natural-language operation entry point where the LLM (Qwen) only parses intent and writes replies; deterministic tools do every calculation and edit, behind a check → preview → confirm → execute → undo state machine with stale-snapshot detection. I built a 74-case Chinese intent eval set (ambiguous, colloquial and high-risk negative cases) and iterated prompts v1.0 → v1.4 by error type: 96% intent accuracy (71/74), 100% valid JSON, zero high-risk false triggers. All 38 live interactions from 13 users succeeded — but only ~13% of users tried it, so the next step is adoption, not accuracy: adoption / undo / trigger-rate metrics are defined and the entry point is moving into the toolbar.

## Result

As of September 2026, seven months in: 94 registered users, 160 scores, 144 PDF exports, 20.7% week-2 retention (n=82) and 19.7% month-2 retention (n=76), on an invite-only beta at lingxian.app. The product renders tablature, staff and jianpu together as you type, converts jianpu to jianzipu with per-note alternatives, diffs versions side by side, supports real-time co-editing with comments, assembles textbooks for print, and ships a browser tuner, a 149-entry fingering reference and a 64-article blog for SEO.

Engineering footprint: 1,200+ commits since February 2026 (see the activity grid), a pnpm/turbo monorepo with web, api and mobile apps plus a shared music-theory package, Prisma migrations, Vitest, Docker images on GHCR behind nginx. The code is public at github.com/Zhuohengli03/lingxian, a mirror of the private development repository whose history the activity grid shows.
