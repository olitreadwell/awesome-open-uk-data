# API contract

The template ships an OpenAPI 3.1 document generated from the same zod
schemas the routes validate against, so the spec and the server cannot
drift.

## Where things live

- Spec: `GET /api/openapi.json` (generated in `src/server/openapi.ts`)
- Swagger UI: `/docs` (renders the spec; assets load from unpkg, version
  pinned in `src/app/docs/route.ts`)
- Contract test: `src/server/openapi.test.ts` (part of `pnpm run check`)

## What the contract test proves

1. The document is valid OpenAPI 3.1 and lists every app route.
2. Every route handler under `src/app/api/**` plus `/health` is documented.
   adding a route without documenting it fails the check.
3. Every documented response matches what the real route handler returns:
   the test calls the handlers and parses the bodies with the documented
   schemas.
4. Type-level checks (`IsEqual` from type-fest) keep the zod-inferred types
   in sync with the documented shapes.

## Dataset-directory surface

New in this template, on top of the base routes below:

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/v1/items` | GET | List with `q`/`city`/`category`/`limit`/`offset`; records the query |
| `/api/v1/items/[id]` | GET | One listing, 404 when unknown |
| `/api/v1/cities` | GET | City names + counts |
| `/api/v1/categories` | GET | Category labels + counts |
| `/api/v1/dataset` | GET | Full dataset JSON, `ETag` = content-hash version, 304 round-trip |
| `/api/v1/dataset.csv` | GET | Dataset CSV sharing the JSON ETag |
| `/api/v1/dataset/meta` | GET | Version, counts, sources, license |
| `/api/search` | GET | Fuzzy search (Fuse.js), shared by the site |
| `/api/items/[id]/view` | POST | View counter for the self-improvement loop |
| `/api/opt-out` | POST | Permanent removal (DB) or PR-tracked request (snapshot) |
| `/api/cron/refresh` | GET/POST | Daily scrape + upsert, `CRON_SECRET`-guarded |
| `/api/subscribe` | POST | Email list (env-gated, off by default) |
| `/api/unsubscribe` | POST | Unsubscribe |
| `/feed.xml` | GET | RSS feed |
| `/calendar.ics` | GET | iCal (all-day events from `calendarDates`) |
| `/sitemap.xml` | GET | Dynamic sitemap incl. items/cities/categories |

The live-server contract test lives in `scripts/contract-test.mjs` and runs
inside `pnpm run smoke` against the standalone build; `pnpm run contract`
runs it against any `BASE_URL`. Snapshot mode (no `DATABASE_URL`) serves
the committed `src/data/snapshot.json`; DB mode reads/writes Postgres.

