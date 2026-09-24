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
- CI on `7c14574`: the `Check (mirrors pnpm run check)` job passed, and the
  full suite passed locally on the same tree (`pnpm run check`: coverage,
  build, smoke, 19 e2e tests, internal and external link checks).
- `Spell check (codespell)` has been red on every CI run since the repo's
  first push (`35275400769`, `35275405521`, `35280991145`, `35823742707`).
  Every hit is a false positive in a file this run never touched: the
  `ot.mozmail.com` placeholder domain in the template's contact addresses,
  and "ONS" read as "owns". Adding `ot` and `ons` to `ignore-words-list` in
  `.codespellrc` clears it; `python3 -m codespell_lib` now exits 0.
- Note for the next run: `pnpm dev`, which the e2e suite starts, rewrites
  `next-env.d.ts` to point at `.next/dev/types/...`. Revert that file before
  ending an iteration, or the wrapper reads the tree as dirty and skips.
- Final state: 23 listings, 25 URLs checked, 0 dead. `pnpm run check:fast`
  green before the push.
- CI on `c34d620`, the last commit of this batch, is green end to end: check,
  spell check, actionlint, yamllint, dependency audit, and both e2e shards.
  The `7c14574` run's e2e shards show as cancelled because the next push
  replaced them through the workflow's concurrency group; that is not a
  failure, and the same tests passed locally on that tree.

## 2026-09-23 (tree hygiene, closes the `next-env.d.ts` note)

- Reproduced the note above: `E2E_PORT=3134 pnpm run test:e2e` exited 0 and
  left `git status --short` showing ` M AGENTS.md` and ` M next-env.d.ts`.
  `next dev` writes `next-env.d.ts` with the dev dist dir
  (`./.next/dev/types/...`) where the committed copy had the build one
  (`./.next/types/...`), so every e2e run dirtied a tracked file and the
  wrapper read the tree as locked on the next iteration.
- Fixed at the root instead of reverting the file by hand: `next-env.d.ts`
  is in `.gitignore` and untracked (`git rm --cached`). Next.js regenerates
  it per run, and its own TypeScript config docs say to add it to
  `.gitignore` and remove it from Git. Checked that typecheck and lint still
  pass with the file absent, both with a warm `.next` and with `.next`
  moved away to mimic a fresh clone.
- Second self-dirtying file found in the same run: `next dev` upserts its
  managed agent-rules block into `AGENTS.md` whenever the block does not
  byte-match the installed Next version, and the em dash removal in
  `a2ff6a6` stopped it matching. `next.config.ts` now sets
  `agentRules: false` (the documented opt-out), and `AGENTS.md` keeps that
  block's pointer to the bundled Next.js docs by hand. No revert step, no
  hand-keeping: a full check now ends with an empty `git status --short`.

## 2026-09-24

- Step 1: `node scripts/check-item-urls.mjs` covered the 23 seeded listings
  (25 URLs). 23 answered 200, `digital.nhs.uk` and `neso.energy` answered 403
  (bot protection, server up), 0 dead. Every `lastVerified` rolled forward to
  2026-09-24 in `559a6cf`.
- Added 3 sources: the Food Standards Agency food hygiene rating API
  (`9d5a437`), MHCLG's Planning Data (`3b54674`), and the Welsh Government's
  StatsWales (`de8ace5`). The dataset is now 26 listings; re-running the URL
  check after those adds reads 31 URLs, 29 ok, 2 bot-blocked, 0 dead.
- The FSA item points at `ratings.food.gov.uk` and
  `api.ratings.food.gov.uk/help`, both of which answer 200 to a plain GET. The
  API endpoints themselves 404 without an `x-api-version` header (checked:
  `/Authorities` is 404 plain and 200 with `x-api-version: 2`), and the
  checker sends no such header, so no item URL points at an endpoint path. The
  item's city is York, from the FSA's correspondence address (Foss House) on
  its GOV.UK contact page.
- Turned down again: `www.opendatani.gov.uk` (root 200, but
  `/api/3/action/package_search` 404s where last run's `/dataset` page 500'd,
  so this is the second failure) and `statistics.gov.scot` (no reply on any
  attempt, second look).
- Turned down for a different reason: `www.nisra.gov.uk/statistics` answers
  406 to a plain GET, which `check-item-urls.mjs` reads as dead. Worth listing
  if the checker ever treats 406 like the 403 case.
- Queued for next run: Charity Commission full register download (200, bulk
  downloads), National Archives Discovery API (200), Defra UK-AIR (200), and
  `get-information-schools.service.gov.uk` (403 to this client, so it needs
  the same checker question answered first).
- `pnpm run check:fast` green on `de8ace5`, and `git status --short` was empty
  after it.
- CI on `4504395`: `CI` (the mirror of `pnpm run check`), `Docker` and
  `Security` passed. `Quality Gates` failed in its Lighthouse job only:
  `total-blocking-time` on `/` measured 358ms against the 200ms budget in
  `lighthouserc.cjs`. The same assertion failed on the previous main commit
  `f438704` (326ms) and on `7c14574`, so it is a runner-dependent perf-budget
  red that predates this batch. No test, budget or threshold was changed.
- `github-pages` failed on `4504395` too, in `actions/upload-pages-artifact`:
  `tar: out: Cannot open: No such file or directory`. It has failed on every
  main push since `dbbcfe9` (2026-09-17) because the workflow expects a static
  export in `out/` and this app does not produce one. Pre-existing, untouched
  here, and worth a separate decision about whether that workflow belongs in
  the repo at all.

## 2026-09-25

- Step 1: `node scripts/check-item-urls.mjs` covered the 26 listings that were
  committed at the start of the run (31 URLs). 29 answered 200,
  `digital.nhs.uk` and `neso.energy` answered 403 (bot protection, server up),
  0 dead. Every `lastVerified` rolled forward to 2026-09-25 in `d4df6d9`.
- Added 3 sources: the Charity Commission register of charities (`99925b6`),
  The National Archives Discovery API (`0b00b37`), and the UKHSA data
  dashboard (`8e1b687`). The dataset is now 29 listings; the URL check re-run
  after those adds reads 37 URLs: 35 ok, 2 bot-blocked, 0 dead.
- Charity Commission: the register root answers 200, but
  `/en/register/full-register-download` 404s while
  `/register/full-register-download` answers 200, so the item points at the
  page that actually lists the extracts (charity, charity_trustee,
  charity_annual_return_parta/partb, and the rest as JSON or tab-delimited
  files). City is Bootle, from the commission's own GOV.UK contact address
  (PO Box 211, L20 7YX), the same route the FSA item's York came from.
- National Archives: `/API/sitemapindex` answers 500 and `/API/search/records`
  answers 400 without parameters, and the checker reads both as dead, so the
  source URL is `/API/`, the Web API help page that lists every endpoint.
  City is London, from the Kew, Richmond TW9 4DU address on the archives'
  contact page. A real search call (`?searchTerm=test`) answers 200.
- UKHSA: the dashboard root and `api.ukhsa-dashboard.data.gov.uk` both answer
  200, and `/access-our-data` is the API developer guide with Swagger docs and
  bulk chart downloads. City is London, from the E14 4PU South Colonnade
  address on the agency's GOV.UK page.
- Closed out, not retried: `www.opendatani.gov.uk` (root 200, CKAN
  `/api/3/action/package_search` 404 again, third consecutive failure) and
  `statistics.gov.scot` (no reply at all, third consecutive failure). Both
  stay off the candidate list until the publisher changes something, per the
  grow-loop rule on a blocker failing three times. Neither one blocked this
  batch, so the run still exits 0.
- `www.nisra.gov.uk/statistics` answered 200 this time, where the last run got
  406, so NISRA moves to the front of the queue. Also queued: Natural England
  Open Data (`naturalengland-defra.opendata.arcgis.com`, root and DCAT feed
  both 200), Defra UK-AIR (`uk-air.defra.gov.uk/data`, 200), and two sites
  that answer 403 to this client and would need the same treatment as
  `digital.nhs.uk`: Historic England's listing data downloads and
  `get-information-schools.service.gov.uk`.
- `pnpm run check:fast` green on `8e1b687`; `git status --short` empty after
  it.
