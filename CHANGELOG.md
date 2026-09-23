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

### Fixed

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
