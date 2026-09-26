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

## 2026-09-26

- Step 1: `node scripts/check-item-urls.mjs` covered the 29 listings committed
  at the start of the run (37 URLs). The first pass read 35 ok, 2 bot-blocked
  (`digital.nhs.uk`, `neso.energy`), and 1 dead: Public Health Scotland's
  portal came back as a connection reset. Two more passes read 0 dead with no
  item change, so the reset was the publisher's, not the listing's.
- `www.opendata.nhs.scot` resets about half of its TLS connections while
  answering the rest (curl: 2 resets then 2 x 200 in four tries; node fetch:
  4 x 200 in four tries, same user agent). The checker made one attempt per
  URL, so it called a live source dead on two of three runs. Root cause fix in
  `41222ac`: connection-level failures (reset, timeout, DNS) are retried three
  times with 1s/2s backoff, HTTP status codes are still never retried. The
  full pass after that reads 43 URLs: 41 ok, 2 bot-blocked, 0 dead.
- Every `lastVerified` rolled forward to 2026-09-26 in `4d061cf`, and the
  CHANGELOG records the same counts.
- Added 3 sources. The dataset is now 32 listings, 43 URLs.
- Natural England Open Data Geoportal (`9954438`): the DCAT feed at
  `naturalengland-defra.opendata.arcgis.com/api/feed/dcat-us/1.1.json` counted
  251 datasets on 2026-09-26, and the distribution formats across the feed are
  CSV, ZIP (Shapefile), GeoJSON, KML, TXT, XLSX, GPKG, GDB and ArcGIS
  GeoServices REST API, which is what the description says. City "York", from
  the Natural England page on GOV.UK ("a head office in York").
- Defra UK-AIR (`a08c5ff`): the `data/` page carries "over 1500 sites across
  the UK", the automatic and non-automatic network split, the Data Selector
  Tool, preformatted raw files and the descriptive and exceedance statistics
  the description lists. The footer states the Open Government Licence v3.0,
  "except where otherwise stated", so the item says "under the OGL v3.0" for
  the archive. The Sensor Observation Service endpoint
  (`/sos-ukair/api/v1/`) timed out on every attempt, so no item URL points at
  it and the description claims no API. City "London", from Defra's GOV.UK
  page, which lists London among the department's staff locations.
- NISRA (`debca09`): the topics in the description are the section list on
  `nisra.gov.uk/statistics` (people and communities; health and social care;
  work, pay and benefits; education and skills; transport, environment and
  climate change; crime and justice; business, economy and trade), and the
  agency's own about-us page is the source for "executive agency of the
  Department of Finance (NI)". The PxStat portal at `data.nisra.gov.uk` answers
  200 but every API path tried (`/api/v1/`, `/api/v1/collection`, `/api/v1/read`)
  404s, so the item points at the statistics hub and claims no API. City
  "Belfast": NISRA's site names no office, so it comes from the Belfast
  addresses (Clare House BT3 9ED, Craigantlet Buildings BT4 3SX) on the
  Department of Finance data-controller block in NISRA's own privacy notice.
- NISRA answers the checker's user agent (3 of 3 runs on `/statistics`), but a
  browser user agent got a 403 from the Varnish cache on `/contact-us`, so it
  is worth a re-check next run before trusting it long term.
- Queued for next run: DWP Stat-Xplore (200, benefit statistics), British
  Geological Survey (`bgs.ac.uk/geological-data/`, 200), JNCC Open Data portal
  (200), Natural Resources Wales evidence and data (200), BGS National
  Geoscience Data Centre (200). Historic England's listing downloads and
  `get-information-schools.service.gov.uk/Downloads` still answer 403 to this
  client, while `get-information-schools.service.gov.uk` itself answers 200.
- Still closed out, not retried: `www.opendatani.gov.uk` and
  `statistics.gov.scot`, both on their third consecutive failure, logged in the
  2026-09-25 entry.
- `pnpm run check:fast` exits 0 on this tree (snapshot, format, lint,
  typecheck, data tests, links, build), and `git status --short` is empty
  after it apart from the CHANGELOG, DATA_SOURCES and LOOP-NOTES edits of this
  batch. Full suite (coverage, smoke, e2e) runs in CI after the push.

## 2026-09-27

- Step 1: `node scripts/check-item-urls.mjs` covered the 32 listings committed
  at the start of the run (43 URLs). One URL read dead:
  `www.opendata.nhs.scot`, where the TLS handshake completes against a current
  certificate and the connection is then reset before any response, on the home
  page and on the CKAN API paths alike. Eight curl attempts and three node
  fetch attempts all failed the same way, two independent proxies timed out on
  the origin (codetabs 522, allorigins 408), and plain HTTP still answers 302
  from the site's BigIP load balancer, so the host is up and the application
  layer is not serving. Yesterday's run saw the same origin fail about half the
  time, which read as transient then and now looks like a degrading service.
  The listing stays in the dataset as `verified: false` with the evidence in
  `notes`; `lastVerified` stays at 2026-09-26, the last day it answered. The
  checker still exits non-zero for it, because it has no concept of an
  annotated source: expect that one DEAD line on every run until PHS fix the
  front end, and treat a third consecutive failure as the three-strikes stop
  from the loop contract.
- Every other `lastVerified` rolled forward to 2026-09-27.
- Added 3 sources. The dataset is now 35 listings, 48 URLs.
- DWP Stat-Xplore (`3f94d7b`): the front page describes the guided table
  builder, free guest access, the free optional account (saved tables, queued
  large tables, custom fields) and downloads into common file formats, and the
  terms page states "Information within Stat-Xplore is made available under the
  Open Government Licence". `https://stat-xplore.dwp.gov.uk/webapi/rest/v1/`
  answers 401 unauthenticated, so the description says the API needs an
  account. City "London", with location "UK-wide" rather than an invented
  address: the DWP about page carries no postal address, only Caxton House
  logo assets.
- British Geological Survey (`3f6a167`): OpenGeoscience publishes maps,
  borehole log scans, photographs and digital datasets free of charge; the
  terms block says data is made available under the Open Government Licence
  "wherever possible" with a "Contains British Geological Survey materials ©
  UKRI [year]" acknowledgement; the web services page lists WFS, APIs, an OGC
  CSW catalogue and the AGS geotechnical download service. The BGS ArcGIS Open
  Data Hub (`maps-bgs.opendata.arcgis.com`, a separate 200) carried 72 datasets
  in its DCAT feed on 2026-09-27, formats CSV, ZIP, GeoJSON, KML, TXT, XLSX,
  GPKG, GDB, OGC WMS and ArcGIS GeoServices REST API. City "Nottingham",
  location "Keyworth, Nottinghamshire": BGS's own Keyworth page says the
  headquarters are there and the nearest railway station is Nottingham, and
  the postcode NG12 5GG confirms it. The pin is Nottingham city, not the
  Keyworth site.
- Care Quality Commission (`e8094e2`): the using-CQC-data page confirms the API
  base `https://api.service.cqc.org.uk`, that authentication is now required,
  that the API covers all active and inactive providers and locations with
  individual detail and linked-organisation history, that the data updates
  daily, that TLS 1.2 or higher is needed, and that the Open Government Licence
  applies. `https://api-portal.service.cqc.org.uk` answers 200, and the API
  answers 401 with a dummy key, which is what a live key-gated service should
  do. "Care directory" spreadsheet downloads are on the same page. City
  "Newcastle upon Tyne"; the coordinate is the Citygate postcode NE1 4PA from
  the CQC's own map link (54.9732, -1.6208).
- The final `check-item-urls` pass reads 48 URLs: 45 ok, 2 bot-blocked but
  live, 1 dead (the annotated PHS listing). All five new URLs answered 200 on
  the first try.
- Checked and rejected this run: JNCC's Resource Hub (`hub.jncc.gov.uk`, 200,
  open-access reports and datasets but no discovered API and the DCAT feed
  404s), Natural Resources Wales' evidence-and-data page (200 but a
  JS-rendered language gate with no content for this client), Historic
  Environment Scotland's archives-and-research page (200, worth another look),
  `get-information-schools.service.gov.uk/Downloads` (403), and CQC's API
  without a key.
- Queued for next run: National Records of Scotland statistics (200), DAERA
  Northern Ireland (200), Sport England research and data (200), Historic
  Environment Scotland, and the BGS National Geoscience Data Centre.
- `pnpm run check:fast` exits 0 on this tree after the last commit (snapshot,
  format, lint, typecheck, data tests, links, build), and `git status --short`
  is clean apart from the CHANGELOG, DATA_SOURCES and LOOP-NOTES edits of this
  batch. Full suite (coverage, smoke, e2e) runs in CI after the push.
