# Loop notes

One entry per grow-loop iteration: what shipped, what was checked and turned
down, and what is queued for the next run.

## 2026-09-23

- First iteration against the fresh seed (20 listings), run on `main`.
- `scripts/check-external-links.mjs` turned out to be the template's offline
  JSX rule (`target="_blank"` plus `rel="noopener noreferrer"`), not a live
  URL check, so step 1 of `scripts/grow-loop-prompt.txt` could not be followed
  as written. Added `scripts/check-item-urls.mjs` and the
  `check:item-urls` script for the live pass, and pointed the prompt at it.
- Two seeded links were dead: GOV.UK's `/api_docs` (404) and the National
  Highways open data page (404 after the site moved to
  opendata.nationalhighways.co.uk). Both re-pointed; the National Highways
  description was rewritten because it still described traffic files that the
  new page does not serve.
- `digital.nhs.uk` and `neso.energy` answer 403 to non-browser clients. Both
  keep `verified: true` and gained a `notes` line, so a future run does not
  re-open the same question.
- Added 3 sources (see `CHANGELOG.md` for the commits): Scottish Health and
  Social Care Open Data, DataMapWales, and SEPA Environmental Data.
- Checked and rejected for now: `www.opendatani.gov.uk` (portal answers 200,
  but `/dataset` returns 500 and the CKAN API path 404s) and
  `statistics.gov.scot` (empty reply on every attempt, over HTTP/1.1 and
  HTTP/2). Both are worth a fresh look next run.
- Queued candidates: Food Standards Agency food hygiene ratings API
  (`api.ratings.food.gov.uk` returns JSON when the request carries
  `x-api-version`), SEPA Open Data Hub, and SEPA's KiWIS water level service.
- Blocker found and fixed at the root: `pnpm run check` runs
  `build:snapshot`, which rewrote `src/data/snapshot.json` with a fresh
  timestamp on every run. That left the tree dirty after the first push, and
  the loop wrapper reads a dirty tree as locked, so every later iteration
  would have skipped and then triggered a heal run. `build-snapshot.mjs` now
  reuses the committed `exportedAt` while the items are unchanged and skips
  the write, so a green check leaves the tree clean. The timestamp still moves
  when the data moves, checked both ways by editing and reverting an item.
- Final state: 23 listings, 25 URLs checked, 0 dead. `pnpm run check:fast`
  green before the push.
