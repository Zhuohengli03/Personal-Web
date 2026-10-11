---
title: "E-commerce user & marketing analytics"
summary: "A metric map for e-commerce analysis and a worked segmentation on an anonymized display-ad sample, built during a 2023 business-analysis internship: 1.05 million impressions joined to 384,559 users, read by price band and clustered into five RFM-labelled segments with a marketing treatment for each."
category: data
role: "Intern — business analysis"
period: "2023.08 – 2023.10"
stack: ["Python", "pandas", "matplotlib", "scikit-learn", "Word"]
scale: ["1.05M impressions · 384,559 users · 61,117 ads", "9-day anonymized display-ad sample", "52-node metric map", "5 user segments, RFM-labelled"]
featured: false
order: 4
gallery: []
---

## Problem

A business-analysis team wanted two things from an intern. First, a written map of what an e-commerce operation should measure — traffic, demand, the funnel, retention, user value — so that the team's reports used the same words. Second, a worked example on real-shaped data: given an ad table, an impression log and a user table, which users deserve more marketing spend, and which are drifting away?

## Decisions

**Write the map before the analysis.** The metric map (Exhibit 1) puts 52 metrics and models under five questions, from UV and PV to the RFM tiers. It was reviewed with the team first, so every chart that followed had a named place to land.

**Band the price, then read the table two ways.** The three tables join on user and ad into one row per impression (Exhibit 2). Price was cut into nine bands, doubling from 100 to 12,800 and above, and each band was read for what gets clicked (Exhibit 3) and for who is looking (Exhibit 4). Reading both prevents the usual mistake of treating a click-rate difference as an audience difference.

**Cluster only the users who clicked, and name the clusters with RFM.** K-means with five centres on shopping depth, click rate and the price of what was clicked, run on the 40,997 users with at least one click. The clusters were then labelled with the map's RFM tiers — click rate standing in for frequency, clicked price for monetary value — so the segmentation and the recommendations spoke the map's language (Exhibit 5).

**Recommend by segment, not by average.** The clustering report gave each tier its own marketing and ad treatment instead of one blended rule for all users.

## Result

The deliverables were the metric map, the analysis report and the clustering report. Click rate falls from 5.5% in the under-100 band to 4.2% around 1,600–6,400 and recovers to 5.1% at the top, while the audience shifts underneath it: low-consumption users drop from 39% of impressions to 17%, high-consumption users rise from 6% to 20%. Of the users who clicked, the largest segment — 37% in the build-time re-run — clicks rarely but on high-priced ads, the win-back tier; the report's own run put its five groups at 45%, 37%, 9%, 8% and under 0.1%.

## Limits

A nine-day anonymized sample whose files were capped at 1,048,575 rows when saved through Excel, so the impression log and the user table are truncated, and user attributes are coded levels without definitions. Per-user click rates on a handful of impressions are noisy: the two segments near a 99% click rate are mostly users seen once. The clustering on this page is a seeded re-run of the report's method, not the original run, which is why the segment sizes differ. The charts show correlations — price, category and audience move together — not causes.
