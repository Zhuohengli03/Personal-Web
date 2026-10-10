---
title: "DaD Market Forecast — price tracking and forecasting, rebuilt around baselines"
summary: "Collects Dark and Darker marketplace listings, aggregates them to hourly prices and forecasts the next 24–168 hours — using a model only when a rolling backtest shows it beats the naive baseline. Season 10 holdout: 9.2% lower error than naive, 64% direction accuracy, and an honest 61% interval coverage against a 90% target."
category: data
role: "Solo developer and analyst — v1 in 2025, audited and rebuilt in 2026"
period: "2025.09 – 2026.10"
stack: ["Python", "pandas", "statsmodels (ETS, ARIMA)", "scikit-learn", "FastAPI", "React + Vite", "SQLite / PostgreSQL", "DarkerDB API"]
scale: ["97,891 listings in Season 10", "7 methods incl. 2 baselines, rolling-origin backtest", "FastAPI backend + React app, 12 forecast test modules", "Open source, AGPL-3.0"]
links: { github: "https://github.com/Zhuohengli03/DaD-Market-Forecast" }
featured: true
order: 2
gallery: []
---

## Problem

In *Dark and Darker*, item prices on the player market move hour to hour and the whole market is wiped every season. The game shows only current listings, so anyone who wants to trade on numbers has to build the dataset first — and then has to answer a harder question than "what will the price be": *is my forecast actually better than assuming tomorrow looks like today?*

## Decisions

**Aggregate first, model second.** Listings are collected page by page until nothing new arrives, deduplicated, and reduced to an hourly median price with volume and listing counts. Gaps up to six hours are forward-filled and never scored; longer gaps cut the series. The hourly median is the only target.

**Baselines run first, and the model has to earn its place.** "Same as last hour" and "same as this hour yesterday" are always in the race. A rolling-origin backtest refits every method at many points in time and scores the next 24 hours; the best method (or an inverse-error ensemble of the top three) is used only if it beats naive by more than 2% with at least five backtest origins. Otherwise the app shows the baseline and says why.

**Features that cannot see the present.** Every feature for hour *t* reads rows up to *t − 1* only — lags, rolling means and volatility of the lagged price, lagged volume — plus the calendar. A test mutates row *t* and asserts the features for *t* do not change.

**Forecast forward, not sideways.** Multi-step forecasts are recursive: predict *t + 1*, append it, recompute features, repeat. Future volume is filled from the last week's hour-of-day profile. ETS and ARIMA forecast on the same series over the same horizon, so all methods are compared on one scale.

**Intervals from residuals, checked against reality.** Prediction intervals are per-horizon empirical quantiles of backtest residuals, and the backtest reports the coverage those intervals would have achieved.

**A holdout the selection never sees.** The last 30% of the season is kept aside; the selected model is refit daily and scored on the next 24 hours, day after day, against naive. That is the number reported here.

## Result

On the Season 10 Cobalt Ore holdout (Sep 18 – Oct 9, 2026, 505 hours): the ensemble of gradient boosting, random forest and ARIMA beat naive by 9.2% on MAE (8.07 vs 8.90), with 15.6% MAPE and 64% direction accuracy; it won 11 of 21 days and lost clearly on four jump days. The 90% intervals covered 61% of actuals. The pipeline ships as an open-source app — FastAPI backend, React front end, scheduler, season management and cross-season reference curves — with 12 test modules on the forecasting package alone.

## Post-mortem

The first version of this project reported R² 0.995. In October 2026 I audited it and found that the number was an artefact: two features were computed from the same row's total price as the target; the model regressed listing by listing rather than over time, so "lag 1" meant the previous listing a few minutes earlier; the "7-day forecast" re-scored the last seven test rows instead of looking forward; and the confidence interval was a heuristic. The rebuild above replaced all of it — aggregation, lag-only features with a leakage test, rolling-origin backtest, baselines with a fall-back rule, recursive forecasting and empirical intervals.

Two things are still open, and they are visible in the exhibits. The intervals cover 61% rather than 90%: residuals are pooled across weeks whose price levels differ by a factor of four, so the next step is to model in log space or scale residuals by the current price. And the in-backtest skill of 28% shrank to 9% on the holdout: the ensemble weights and the model choice were fitted on the same backtest that scored them, so selection should use one half of the origins and be evaluated on the other.
