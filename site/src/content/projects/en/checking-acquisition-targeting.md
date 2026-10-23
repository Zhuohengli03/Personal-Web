---
title: "Checking-account acquisition targeting"
summary: "An individual timed project for NYU's Advanced Business Analytics, on a course case about a fictional regional bank: a funding model that predicts how much a new checking account will hold, combined with the bank's response score into an expected value per letter. Mailing the 8,000 highest-value prospects instead of the most likely responders raises expected first-year profit from about $17K to about $120K on the same budget."
category: data
role: "Individual project — NYU Advanced Business Analytics"
period: "2026.10"
stack: ["SAS Viya (Visual Analytics)", "Python", "pandas", "Excel"]
scale: ["30,000 past prospects · 25,000 to score", "2 funding models: linear regression, random forest", "9 segments · 8,000-letter budget", "≈$120K vs ≈$17K expected profit"]
featured: false
order: 7
gallery: []
---

## Problem

A bank mailed checking-account offers to 30,000 prospects last year and chose them with a response model: the people most likely to open. About 7% did. Finance then found that many of those accounts held almost nothing, and after the $100 opening bonus they lost money. With a fixed $8,000 budget for 8,000 letters and 25,000 new names, the marketing head asked a different question: who is worth the most to the bank, how much profit should she expect, and how does that compare with last year's rule?

## Decisions

**Frame the decision as profit, not response.** An opened account is worth 0.025 × its 90-day balance + $50 in fees − the $100 bonus, so it only pays above a $2,000 balance. In last year's file a third of the accounts that opened (732 of 2,161) were below that line. The response score answers *will they open*; the missing half was *how much will they bring*. The two combine into the expected value of one letter (Exhibit 1), and the mail file is ranked by that value.

**Check the score before trusting it.** In ten equal groups the top tenth opens at 3.26 times the average rate, and each group's average score is within about 0.8 points of its real open rate (Exhibit 2), so the probabilities could go straight into the formula.

**Build the funding model on openers only, and keep the future out of it.** The predicted balance is multiplied by the probability of opening, so it has to be the balance *if* the prospect opens: the model was fitted on the 2,161 accounts that opened, with a 70/30 holdout. Two fields were measured at the data extract date, after the campaign — the total deposit balance, which already contains the new account, and payroll direct deposit — and were left out as leakage. The 4,194 prospects without third-party data are blank on all nine vendor fields at once, so "no vendor match" was kept as its own level rather than imputed away; a 999 in days-since-contact means never contacted.

**Choose the model the business can use.** A random forest was 2.5% better on validation RMSE ($6,620 against $6,790). The linear regression was kept: it ranks almost identically, it can be scored by hand and explained to the marketing team, and it can be audited for fairness. Its known flaw, negative predictions for low-value profiles, is handled by flooring at $0 as Finance specified.

**Turn the model into a plan without a scoring system.** Nine segments — age group × net-worth band, plus the no-vendor-data group — were valued from last year's results and counted in the new file (Exhibit 4), then mailed in order of value until the 8,000 letters ran out (Exhibit 5). Three new prospects were also scored by hand with the regression to show the logic at the level of one person (Exhibit 6).

## Result

The balance drivers point the opposite way from the response drivers (Exhibit 3). Net worth matters most: $1M+ adds about $27,000 to the expected balance against under $50K; each $1K of household income adds $46 and each year of age $123, while each point of digital engagement takes away $48. The validation metrics say the model is better at ranking than at dollars: a typical error of about $3,600 (MAE), RMSE pulled up by a handful of six-figure accounts, and a Spearman rank correlation of 0.74 against an R² of 0.52 — enough to put the right people above the cutoff.

Ranking segments by value (Plan A) mails people aged 45+ with $250K or more, younger people with $250K or more, and part of the younger $50K–250K group, for an expected first-year profit of $119,731. Last year's rule (Plan B) spends 5,089 letters on young prospects with under $50K, the only segment with a negative value, and expects $16,825. The value-first plan opens fewer accounts, which the memo told the marketing head to expect. Positive-value segments hold 19,911 new prospects, about 2.5 times the budget, so the memo also made a tested case for more letters into the next segments, stopping before the two break-even ones.

## Limits

The balance predictions are rough: errors of several thousand dollars are typical, and the average of the smallest segment (under 45 with $1M+) rests on two past openers. Segment values are last year's averages; last year's prospects got a random $0, $100 or $200 bonus, while everyone now gets $100. The models cannot see assets held at other banks, and 14% of prospects have no vendor data at all. Targeting on age, net worth and ZIP-code income also carries fair-lending and reputational risk, so the memo asked for a pre-launch comparison of the mailed share by ZIP income tier and age band against the eligible pool, and a randomized control group mailed by last year's rule to measure profit per letter at 90 days rather than response alone.
