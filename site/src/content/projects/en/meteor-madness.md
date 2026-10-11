---
title: "Meteor Madness — NASA Space Apps 2025"
summary: "An asteroid-impact dashboard built in 48 hours for the NASA Space Apps Challenge: live NASA feeds (near-Earth objects, close approaches, fireballs, natural events) behind a plain Java server, and a browser that turns a diameter, a speed and a point on a Three.js globe into crater, blast, seismic, tsunami, population and cost estimates, plus a kinetic-impactor deflection simulation."
category: product
role: "Two-person team — half of the features end to end: front end, backend and API"
period: "2025.10 (48-hour hackathon)"
stack: ["Java 17", "com.sun HttpServer + Jackson", "Vanilla JavaScript", "Three.js", "Leaflet", "NASA NeoWs · CNEOS CAD & Fireball · EONET"]
scale: ["48 hours · 44 commits · 2 people", "7,425 lines: 6,205 JS / HTML / CSS, 1,220 Java", "4 NASA sources · 8 endpoints · 7 tabs", "Run on Oct 11, 2026: 200 close approaches, 429 fireballs"]
links: { github: "https://github.com/Zhuohengli03/Hackthon-Meteror" }
featured: false
order: 6
gallery:
  - { src: "../../../assets/work/meteor-madness/01.png", alt: "Dashboard overview on a dark starfield: tab bar, four stat cards for close approaches, fireballs, hazardous objects and last update, and a data summary", caption: "Overview: the four NASA feeds reduced to counts, averages and date ranges, refreshed from the Java server on load." }
  - { src: "../../../assets/work/meteor-madness/02.png", alt: "Close approaches tab with a world map of marker dots, a date-range and distance filter, and the start of a data table", caption: "Close approaches: a date window, a maximum distance in AU, and the objects plotted on a Leaflet map above the table." }
  - { src: "../../../assets/work/meteor-madness/03.png", alt: "Fireballs tab with red markers on a world map over Asia and the Pacific, a since-date filter and a table header", caption: "Fireballs: atmospheric entries from the CNEOS catalogue, mapped by their reported position." }
  - { src: "../../../assets/work/meteor-madness/05.png", alt: "Impact prediction tab: custom parameters on the left with a 300 m diameter and stony density, and a 3D Earth globe showing the Americas on the right", caption: "Impact prediction: set diameter, density, speed and angle, then click the Three.js globe or type a latitude and longitude." }
  - { src: "../../../assets/work/meteor-madness/06.png", alt: "Outcome cards for an impact: 8.5 EJ energy, 4.4 km crater, seismic magnitude 0.5, 116 million people exposed, 587 billion dollars loss, and a grid of affected cities with distances", caption: "The outcome cards for a 300 m stony body at 20 km/s over New York, with the nearest major cities and their exposure." }
  - { src: "../../../assets/work/meteor-madness/07.png", alt: "Simulation tab titled Asteroid Impact and Deflection Simulation with a Monte Carlo process description", caption: "Deflection: a Monte Carlo over size, speed, Δv and lead time, reporting the Earth-hit probability before and after a kinetic impactor." }
---

## Problem

The Meteor Madness challenge asked for a tool that makes NASA's near-Earth-object data understandable and lets people explore what an impact would do and whether it could be deflected. The raw material is four separate NASA feeds with different shapes, rate-limited demo keys, and physics that most visitors have never seen. We had 48 hours and two people.

## Decisions

**Put a thin server between NASA and the browser.** A Java `HttpServer` with no framework fetches the NeoWs feed, CNEOS close approaches and fireballs, and EONET events, flattens each to simple JSON and serves eight endpoints (Exhibit 1). When the demo key hits its quota the server rotates through three backups instead of failing the page.

**Do the physics in the browser.** Mass, energy, crater, blast radius, seismic magnitude, tsunami height, exposed population and economic loss are computed in JavaScript from the user's inputs, so the globe, the 2D map and the outcome cards update instantly. The formulas are simple power laws chosen to be readable in a hackathon, not research-grade (Exhibit 2).

**Make the impact point a click.** My part of the front end was the Three.js Earth, textured with NASA Blue Marble, synchronised with a Leaflet map so a click on either sets the latitude and longitude that the prediction uses. I also reworked the calculation methods and fixed the 2D map to use real-world coordinates.

**Show uncertainty and the way out.** Every outcome carries a range (±20% on crater size, ±0.5 on magnitude), and the Simulation tab runs a Monte Carlo over size, speed, Δv and lead time to report how a kinetic impactor changes the hit probability.

## Result

A working dashboard with seven tabs, submitted on time. Run a year later, it still answers from live data: on 11 October 2026 the close-approach tab pulled 200 objects within 0.05 AU, twelve of them inside the Moon's orbit (Exhibit 3), and the fireball tab 429 events since 2015, led by the 49 kt Bering Sea airburst of 2018 (Exhibit 4). A 300 m stony body at 20 km/s over New York comes out as a 4.4 km crater and 116 million people exposed.

## Limits

Hackathon physics: a 10 m body is given a 340 m crater and seismic magnitude stays at zero below about 200 m, which real impact models would not do. Population exposure comes from a short built-in list of major cities, not a population grid. The NASA key lives in a properties file, so the rate limit is shared by everyone who runs it. The code was written in two days with AI assistance, which the repository discloses, and has no tests.
