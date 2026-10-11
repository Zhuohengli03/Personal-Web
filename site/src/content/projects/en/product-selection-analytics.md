---
title: "Operations & product-selection analytics"
summary: "A product-selection metric system and a one-page daily operations brief, built from five sales exports during a 2023 internship: 88 listings across 5 brands and 3 marketplaces, read every morning for the trend, the brand split, and per-listing stock, ad and price signals."
category: data
role: "Intern — analysis and reporting"
period: "2023.10 – 2023.11"
stack: ["Excel", "Word", "CSV exports: ads, orders, inventory, listing page, daily totals"]
scale: ["88 listings · 5 brands · 3 marketplaces", "14,753 source rows, October 2023", "31-metric selection system", "Anonymized data: brands AA–EE, masked listing IDs"]
featured: true
order: 3
gallery: []
---

## Problem

An e-commerce operations team selling five brands in the US, Canada and Japan gets a separate export for every question: ads, orders, inventory, listing pages, daily totals. Nobody reads five tables before the morning meeting. Two things were missing: a shared answer to *what makes a product worth selling*, and a one-page brief that says what changed yesterday and where to look.

## Decisions

**Define the metrics before the report.** The selection system (Exhibit 1) puts 31 metrics under five questions: is there demand, how hard is the competition, what is winning inside the category, how do customers rate it, and does the price leave a margin. Every column in the brief maps back to a node in that tree, so the report and the checklist speak the same language.

**Join on the keys the business already uses.** The five exports share date, marketplace and listing ID. Joined on those three keys they become one table per listing per day, which is what every question below is asked of.

**Read top-down.** The brief (Exhibit 2) opens with a 7-day trend of units, revenue, day-over-day change, page views and refund rate, then the brand split for the day, then a per-listing table with the derived columns that make a row actionable: days since the last sale, 7-day average, estimated daily units, days to sell-out at current stock, CTR, CPC, ACoS, category rank, reviews, price and rating.

**Flag, don't explain.** The brief marks listings that will sell out within a week, listings whose ACoS is above the blended rate, and listings whose rank dropped. The explanation is the team's job; the brief's job is to make sure the question gets asked the same day.

## Result

The brief for October 31, 2023 is the deliverable; Exhibits 3–5 show what it surfaced across the month. Units fell from about 950 a day to about 160 after October 22 while the number of selling listings with no inventory rose from 4 to 21. The best-selling listing was repriced five times, from 29.99 to 38.59, and its category rank slid from #74 to #878 as its daily units collapsed. Two listings took 40% of ad spend at a healthy 14–16% ACoS, while thirteen small listings spent about 450 on ads that returned less than they cost, or nothing.

## Limits

One month of anonymized exports, assembled in Excel. The charts show correlations the brief would have flagged, not causes: a price rise, a stock-out and a seasonal dip can all end in the same rank chart. The metric system was a checklist agreed with the team, not a scored model validated against later sales.
