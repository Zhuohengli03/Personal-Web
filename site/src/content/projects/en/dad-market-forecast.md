---
title: "DaD Market Forecast — a 24/7 price pipeline with 7-day forecasts"
summary: "Automated collection of in-game market prices into PostgreSQL, feature engineering without leakage, and an ensemble of ten models plus ARIMA to call buy/sell windows with a confidence band."
category: data
role: "Solo developer and analyst"
period: "2025.09 – 2025.10"
stack: ["Python", "PostgreSQL", "scikit-learn", "XGBoost", "statsmodels (ARIMA)", "Prophet", "asyncio scheduler"]
scale: ["6,000+ listings per item per run, deduplicated", "Item categories: ore, consumable, equipment, material", "10 models + voting ensemble, R² 0.995 on Gold Ore", "6 GitHub stars"]
links: { github: "https://github.com/Zhuohengli03/DaD-Market-Forecast" }
featured: true
order: 2
gallery:
  - { src: "../../../assets/work/dad-market-forecast/02.png", alt: "Collector log showing pages of 50 rows, zero duplicates, and an automatic stop after three empty pages", caption: "Collector run: 6,164 new rows across 124 pages; stops by itself after three consecutive pages with nothing new." }
  - { src: "../../../assets/work/dad-market-forecast/04.png", alt: "Stability test and fused 7-day forecast combining ML, ARIMA and a statistical baseline", caption: "Three-run stability test, then ML, ARIMA and a statistical baseline fused into one 7-day range." }
---

## Problem

In *Dark and Darker*, item prices on the player market swing hour to hour. Trading well means knowing the typical price of an item, spotting when it is cheap, and guessing where it goes next. The game offers no history — only the current listings — so anyone who wants to decide with data has to build the dataset first.

## Decisions

**Collect first, model second.** The first weeks were only ingestion: an API collector per item with deduplication and batch inserts into PostgreSQL, a scheduler that keeps running through interruptions, and an automatic stop after three consecutive pages with no new rows. Without a clean, continuous series every later model is a guess.

**Configuration over code for items.** Items live in `items_config.json` by category (ore, consumable, equipment, material) and can be enabled or disabled without touching Python. New API files are auto-discovered. This kept the pipeline running while the item list changed.

**Lag features, strictly in the past.** Features are built only from values available at prediction time (price lags, rolling means, day-of-week); the pipeline reports the leakage check and drops features to limit overfitting — 15 kept from 32. A forecast that peeks into the future looks great and trades badly.

**Ensemble, with the disagreement shown.** Random Forest, Extra Trees, Gradient Boosting, four linear models, SVR, an MLP and XGBoost vote; ARIMA and a statistical baseline are fused in for the forecast. The output is a 7-day path with a 95% confidence band and a plain-language risk note. When the band widens — as it does on the last forecast day — that is the signal to wait rather than trade.

## Result

A pipeline that ran unattended, a PostgreSQL store of listings across item categories, and daily 7-day forecasts with trend, risk level and a buy/sell suggestion. On the Gold Ore run shown in the gallery: 6,164 rows collected, ensemble R² 0.995 with no overfitting (CV gap −0.011), and a "price falling, consider selling — high risk" call. The repository has 6 stars and a bilingual README; its api / database / analysis / scheduler layout is the skeleton I reuse for new data projects.

Because the game resets its market every season, this is a reference case: the numbers above come from one collection window and the forecast made at its end, not from a live market.
