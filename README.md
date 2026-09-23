# UK Open Data

Curated directory of public UK open data sources: UK government, devolved
administrations, and civic datasets, with verified links, an OpenAPI-backed API,
and a daily grow loop. Public data only; opt-out respected.

[![CI](https://github.com/olitreadwell/dataset-directory-template/actions/workflows/ci.yml/badge.svg)](https://github.com/olitreadwell/dataset-directory-template/actions/workflows/ci.yml)

Built from the [dataset-directory-template](https://github.com/olitreadwell/dataset-directory-template): a dataset + scrapers + OpenAPI API + website + feeds + community loop + daily refresh app, deployed to Vercel.

Every listing is a public open data source with a verified link. `lastVerified` shows when a link was last checked; the grow loop verifies links and adds new sources daily.

## What you get

- **Dataset**: zod-validated `items` (id/slug, city/region, location,
  lat/lng, contact, website, socials, categories, description, source,
  `lastVerified`, verified, active, opt-out) with tests that fail on bad
  data. Commit `src/data/items.ts`, regenerate the snapshot with
  `pnpm run build:snapshot`, or scrape.
- **API**: `/api/v1/items`, `/api/v1/items/{id}`, `/api/v1/cities`,
  `/api/v1/categories`, `/api/v1/dataset` (JSON + `.csv`, ETag +
  content-hash version), `/api/v1/dataset/meta`, `/api/search`,
  `/api/items/{id}/view`, `/api/opt-out`, `/api/cron/refresh`, plus the
  base `/health`, contact and feedback endpoints. OpenAPI 3.1 at
  `/api/openapi.json`, Swagger UI at `/docs`, contract-tested against a
  live server in `pnpm run smoke`.
- **Website**: home + browse (`/items`, `/cities/...`, `/categories/...`),
  fuzzy search (Fuse.js), item detail with community add/fix/review issue
  links, interactive map, opt-out page, dark mode.
- **Feeds**: `/feed.xml` RSS, `/calendar.ics` iCal, dynamic
  `/sitemap.xml`, `/robots.txt`.
- **Scrapers**: Node + cheerio-ready framework with robots.txt checks,
  rate limiting, exponential backoff + jitter, per-run `scrapes` logging
  and the candidate discovery → verification → promotion loop. Ships an
  offline example scraper; add your real sources in `src/lib/scrapers/`.
- **Snapshot mode by default**: no `DATABASE_URL`? The site serves the
  committed `src/data/snapshot.json`. Set `DATABASE_URL` and `pnpm db:setup`
  to switch to Postgres (`items`, `scrapes`, `candidates`, `analytics`).
- **Daily refresh**: Vercel Cron at 2am NZT (`vercel.json`),
  `CRON_SECRET`-protected.
- **Community loop**: opt-out, prefilled add/fix/review issues from every
  detail page, zod + tests as the PR gate, optional env-gated email
  subscribe module. Ethics: public data only, polite scraping.

## Quick start

```bash
gh repo create my-directory --template olitreadwell/dataset-directory-template --private
cd my-directory
pnpm install
pnpm run setup          # thing, city, region, seed sources, deploy target
pnpm run dev            # http://localhost:3000
```

## Commands

| Command | Purpose | CI gate |
| --- | --- | --- |
| `pnpm run dev` | Dev server | |
| `pnpm run build` | Production build | Blocking |
| `pnpm run setup` | Interactive scaffolder (identity, env, deploy) | Tested |
| `pnpm run build:snapshot` | Regenerate `src/data/snapshot.json` from `items.ts` | Blocking |
| `pnpm run scrape` | Run scrapers (snapshot or DB mode) | |
| `pnpm run scrape:apply` | Scrape and write merged items to the snapshot | |
| `pnpm db:setup` | Migrate + seed Postgres (DB mode) | |
| `pnpm db:snapshot` | Export live DB → `snapshot.json` | |
| `pnpm run contract` | Live server ↔ OpenAPI contract test | In smoke |
| `pnpm run typecheck` | `tsc --noEmit` | Blocking |
| `pnpm run lint` | ESLint | Blocking |
| `pnpm run format:check` | Prettier check | Blocking |
| `pnpm test` | Vitest unit/component | Blocking |
| `pnpm run test:coverage` | Coverage gate | Blocking |
| `pnpm run test:e2e` | Playwright | Blocking |
| `pnpm run test:a11y` | axe route audit (WCAG 2.2 A/AA) | Blocking (in e2e) |
| `pnpm run smoke` | Boot + curl + contract test | Blocking |
| `pnpm run check:links` | Internal link integrity | Blocking |
| **`pnpm run check`** | All of the above | Mirrored 1:1 |
| `pnpm run audit` | Dependency audit | Advisory |

## Data integrity + community

- `lastVerified` + source URL required on every item; stale-flag logic
  (`src/lib/stale.ts`) badges listings older than 180 days.
- Duplicate ids/names, bad dates, slug mismatches and broken calendar
  ranges fail `pnpm run check` (`src/data/items.test.ts`).
- Community contribution flow: prefilled **add / fix / review** issue
  links from every detail page (requires `NEXT_PUBLIC_GH_REPO`), PR
  checklist in [CONTRIBUTING.md](CONTRIBUTING.md), dataset tests as the gate.

## Docs

- [Template usage: new project in 10 min](TEMPLATE_USAGE.md)
- [Data sources & status](DATA_SOURCES.md)
- [Self-improvement loop](SELF_IMPROVEMENT.md)
- [Onboarding](docs/onboarding.md) · [Deployment](docs/deploy.md) ·
  [API contract](docs/api.md) · [Contact & feedback](docs/contact.md) ·
  [Accessibility](docs/a11y.md) · [Testing](docs/testing.md) ·
  [FAQ](docs/faq.md)
- [Contributing guide](docs/contributing/00-index.md)

## Tech stack

- Next.js App Router (16), React 19, TypeScript strict
- Tailwind CSS 4 + Radix UI primitives; dark mode via `prefers-color-scheme`
- Vitest + Testing Library + vitest-axe; Playwright e2e
- pnpm (lockfile committed, frozen installs in CI); ESLint 9 flat config +
  Prettier; husky pre-commit/pre-push
- Zod validation at the boundary, pino structured logs, centralized errors
- Scraping: cheerio-ready, `robots-parser`, Fuse.js, `pg` for DB mode,
  `feed` for RSS
- OpenAPI 3.1 + Swagger UI at `/docs`, contract-tested
- Multi-stage Dockerfile with `HEALTHCHECK` on `/health`

## Agent-first repo

`AGENTS.md` + `CLAUDE.md` tell AI agents exactly how this repo works, what
the quality bar is, and how to verify changes.
