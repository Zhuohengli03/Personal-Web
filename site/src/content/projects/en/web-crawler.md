---
title: "Dynamic web crawler"
summary: "A Streamlit + Selenium tool for pages that load as you scroll: point it at a list page, say how to find the items — XPath, CSS, ID, class, tag or a regular expression — and it scrolls, collects the links, visits each page, extracts built-in and custom fields, and lands the rows in Excel, CSV or a MySQL table it creates itself."
category: product
role: "Solo developer"
period: "2025.06 – 2025.08"
stack: ["Python", "Streamlit", "Selenium (Edge WebDriver)", "BeautifulSoup + lxml", "pandas", "MySQL"]
scale: ["3,404 lines of Python · 11 modules", "5 locator modes + 8 regex patterns", "Bilingual UI (ZH / EN)", "Run on juejin.cn: 60 links, 60 pages, 4.6 min"]
links: { github: "https://github.com/Zhuohengli03/Crawler" }
featured: false
order: 5
gallery:
  - { src: "../../../assets/work/web-crawler/01.png", alt: "Home screen of the crawler app: a language switch in the sidebar and two entry buttons, dynamic crawler and database search", caption: "Home: two tools in one app, the crawler and a search over what it stored; Chinese or English from the sidebar." }
  - { src: "../../../assets/work/web-crawler/02.png", alt: "Crawler configuration page with an intro, a 'crawler settings' heading and a target URL field", caption: "Crawler setup: target URL, list page or single article, how many items, request header, driver path, wait and pause times, headless mode." }
  - { src: "../../../assets/work/web-crawler/03.png", alt: "Advanced filter section with locator-mode dropdowns and selector fields for the list links and the article title", caption: "Advanced filter: a locator mode and selector for the list links, the title, the body and the images. This is the juejin.cn configuration the run used." }
  - { src: "../../../assets/work/web-crawler/04.png", alt: "MySQL table search page with database parameters, a table-name field, a keyword dropdown set to URL and a load button", caption: "Database search: pick a table and a pattern — URL, phone, name, email, image — to pull matches out of the stored HTML." }
---

## Problem

News and community sites load their lists as you scroll: a request to the page returns the first twenty items and nothing else. Scraping them means driving a real browser, and the people who wanted the data — classmates collecting articles for coursework — did not want to write Selenium code for every site. The tool had to take a URL and a description of where the items are, and do the rest.

## Decisions

**Drive a real browser, count before scrolling.** The crawler opens the page in Edge, waits for the main element, and counts how many items are already there. Only if that is short of the target does it scroll (Exhibit 1). Each round scrolls to the bottom, pauses one second, and counts again; it stops when the target is met, after three rounds that add nothing, or at twenty scrolls.

**Locate by selector or by pattern.** Items can be found exactly, with XPath, a CSS selector, an ID, a class or a tag, or by a regular expression over the page: URLs, phone numbers, emails, images, names (Exhibit 3). Custom fields use the same locators, so author, date and view count were added to the run without touching code.

**Let the data decide the table.** Exporting to MySQL creates the table from the rows: integers, floats, dates and datetimes get their own types, short strings become VARCHAR(500), long ones LONGTEXT (Exhibit 4). Table names are validated so a user cannot inject SQL through the form.

**Keep the configuration.** Every run's settings are saved to JSON and reloaded next time, and the UI is bilingual, because the users were.

## Result

The run behind the exhibits asked for 60 article links from juejin.cn. The page opened with 29, three scroll rounds brought it to 63, and the crawler had its 60 within 10 seconds (Exhibit 2). Visiting the 60 pages took four and a half more minutes and produced 60 rows with a title and body on every one, custom fields on 93% and images on 75%. The tool wrote the table schema from those rows: five short columns as VARCHAR(500), body, images and raw HTML as LONGTEXT.

## Limits

One configuration serves one site layout; when the site changes its class names the selectors have to be redone. Pages are visited one at a time with a fixed pause, so a run costs four to five seconds per page, and a page that times out is skipped. The idle-round stop is crude: a slow network can look like the end of the list. There is no handling of robots.txt or rate limits beyond the pause, no login flow (the checkbox is a placeholder), and only Edge is supported.
