# lizhuoheng.com

Personal site of Zhuoheng Li. Astro static site in `site/`, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Develop

    cd site && npm install && npm run dev

## Test

    cd site && npm test            # vitest unit tests
    cd site && npm run e2e         # playwright against astro preview

## Refresh data

    node scripts/fetch-github.mjs            # rewrites site/src/data/github.json (needs gh auth)
    cd site && node scripts/shoot.mjs        # reshoots live-site screenshots into site/src/assets

Open items that need the owner are listed in `CONTENT-TODO.md`.
