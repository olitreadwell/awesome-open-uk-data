# Changelog

All notable changes documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Dataset-directory template layer over the base starter:
  - Generic `items` schema (zod) with seed dataset + snapshot mode
    (`src/data/snapshot.json`) and Postgres mode (`items`, `scrapes`,
    `candidates`, `analytics`)
  - OpenAPI API surface: `/api/v1/items`, `/items/{id}`, `/cities`,
    `/categories`, `/dataset` (JSON+CSV, ETag/version), `/dataset/meta`,
    `/api/search`, `/api/items/{id}/view`, `/api/opt-out`,
    `/api/cron/refresh`, subscribe/unsubscribe; Swagger at `/docs`;
    live-server contract test in smoke
  - Website: browse, fuzzy search, detail pages with community
    add/fix/review issue links, map, opt-out, dark mode
  - Feeds: `/feed.xml`, `/calendar.ics`, dynamic `/sitemap.xml`,
    `/robots.txt`
  - Scraper framework: robots.txt checks, rate limiting, backoff+jitter,
    per-run scrapes logging, candidate discovery→verification→promotion,
    with an offline example scraper
  - Vercel Cron daily refresh (2am NZT, `CRON_SECRET`-guarded)
  - Extended `pnpm run setup` scaffolder (thing, city, region, seed
    sources, deploy target) + `sync-from-template.mjs` pointed at this
    repo; docs: TEMPLATE_USAGE, DATA_SOURCES, SELF_IMPROVEMENT
- Starter template skeleton: Next.js, TS strict, Tailwind 4, Vitest,
  Playwright, ESLint 9, Prettier, husky, Docker, CI.
- Tracked follow-up: user feedback feature →
  https://github.com/olitreadwell/dataset-directory-template/issues/1
- 2026-09-23: `scottish-health-social-care-open-data`: Public Health
  Scotland's open data platform, carrying health and social care statistics
  under the Open Government Licence with a CKAN API.
- 2026-09-23: `datamap-wales`: the Welsh Government spatial data platform,
  with its dataset catalogue, map viewer, and catalogue API.
- 2026-09-23: `sepa-environmental-data`: SEPA's environment dataset index,
  with downloads and REST/WMS map services.
- 2026-09-24: `food-hygiene-rating-scheme-api`: the Food Standards Agency's
  food hygiene ratings as a free JSON API for England, Scotland, Wales and
  Northern Ireland, with no key or sign-up and an x-api-version header on
  every call.
- 2026-09-24: `planning-data`: the Ministry of Housing, Communities and Local
  Government's planning and housing platform for England, with one API over
  100+ datasets and bulk downloads.
- 2026-09-24: `statswales`: Welsh Government statistics about Wales, with a
  public API that lists datasets and downloads them as JSON, CSV or XLSX.
- 2026-09-25: `charity-commission-register`: the Charity Commission's daily
  extract of the England and Wales charity register as JSON and
  tab-delimited files, including the charity, trustee and annual return
  tables.
- 2026-09-25: `national-archives-discovery-api`: The National Archives
  Discovery catalogue of records held by archives across the UK, queryable
  over a public REST API.
- 2026-09-25: `ukhsa-data-dashboard`: the UK Health Security Agency's public
  health dashboard for England, with a documented API and bulk chart
  downloads.
- 2026-09-26: `natural-england-open-data`: Natural England's geoportal on the
  Defra ArcGIS Hub, with 250+ datasets from SSSIs and National Nature
  Reserves to ancient woodland and the England Coast Path, downloadable as
  CSV, Shapefile, GeoJSON, KML, GeoPackage or file geodatabase.
- 2026-09-26: `defra-uk-air`: Defra's air quality data archive, carrying
  hourly measurements from 1,500+ monitoring sites across the UK with a data
  selector, preformatted raw files and descriptive and exceedance statistics.
- 2026-09-26: `nisra-statistics`: the Northern Ireland Statistics and Research
  Agency's statistics hub, an executive agency of the Department of Finance
  (NI), covering population and the census, health, work and benefits,
  education, transport, the environment, crime and the economy.

### Fixed

- 2026-09-26: rolled every `lastVerified` forward after
  `pnpm run check:item-urls` re-checked all 43 listing URLs (41 answered, 2
  bot-blocked but live, 0 dead).
- 2026-09-26: `check-item-urls.mjs` retries a connection-level failure up to
  three times with backoff before calling a URL dead. Public Health
  Scotland's portal (`www.opendata.nhs.scot`) resets a share of its TLS
  connections while answering the rest, so a single reset kept reading as a
  dead source. HTTP status codes are still never retried.
- 2026-09-25: rolled every `lastVerified` forward after
  `pnpm run check:item-urls` re-checked all 37 listing URLs (35 answered, 2
  bot-blocked but live, 0 dead).
- 2026-09-24: rolled every `lastVerified` forward after
  `pnpm run check:item-urls` re-checked all 25 listing URLs (23 answered, 2
  bot-blocked but live, 0 dead).
- 2026-09-23: re-pointed two dead publisher links at their live pages (GOV.UK
  content API docs, National Highways open data services) and rolled every
  `lastVerified` forward after re-checking all 22 listing URLs.
- 2026-09-23: added `scripts/check-item-urls.mjs` (`pnpm run check:item-urls`)
  so the daily loop re-checks listing URLs against the live web. It stays
  outside `pnpm run check`, because that gate has to pass offline.
- 2026-09-23: `build:snapshot` no longer rewrites `src/data/snapshot.json`
  when the items are unchanged, so `pnpm run check` leaves the tree clean
  instead of dirtying it with a new timestamp on every run.
- 2026-09-23: `.codespellrc` ignores the `ot.mozmail.com` placeholder domain
  and "ONS", clearing the spell-check gate that had been red on every CI run
  since the first push.
- 2026-09-23: `next-env.d.ts` is gitignored and no longer tracked. Next.js
  regenerates it per run (dev points it at `.next/dev/types/...`, build at
  `.next/types/...`), so tracking it left the tree dirty after every e2e run
  and the grow loop skipped the next iteration.
- 2026-09-23: `next.config.ts` sets `agentRules: false`. `next dev` was
  rewriting the managed agent-rules block in the tracked `AGENTS.md` on
  every run, dirtying the tree the same way. `AGENTS.md` keeps the block's
  pointer to the bundled Next.js docs by hand.
