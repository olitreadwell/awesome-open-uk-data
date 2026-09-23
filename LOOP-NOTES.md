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
