# Data sources

All sources are public. Scrapers live in `src/lib/scrapers/`, run daily via
Vercel Cron, and record every run in `scrapes` (DB mode) or
`logs/scrapes.jsonl` (snapshot mode) with status, items found and items new.

## Working now

| Source | What we get | Status |
| --- | --- | --- |
| `example-listings` (this repo's `scripts/examples/listing-entries.json`) | seed pipeline demo | ✅ offline demo |

| `data.gov.uk` | initial seed source | ✅ planned |
| `ONS` | initial seed source | ✅ planned |
| `Companies House` | initial seed source | ✅ planned |
| `HM Land Registry` | initial seed source | ✅ planned |
| `TfL` | initial seed source | ✅ planned |
| `UK Police Data` | initial seed source | ✅ planned |
| `Explore Education Statistics` | initial seed source | ✅ planned |
| `OS Data Hub` | initial seed source | ✅ planned |
| `Bank of England` | initial seed source | ✅ planned |
| `London Datastore` | initial seed source | ✅ planned |
| `Met Office DataPoint` | initial seed source | ✅ planned |
| `UK Data Service` | initial seed source | ✅ planned |
| `Public Health Scotland` (Scottish Health and Social Care Open Data) | initial seed source | ✅ planned |
| `Welsh Government` (DataMapWales) | initial seed source | ✅ planned |
| `SEPA` (environmental data publication) | initial seed source | ✅ planned |
| `Food Standards Agency` (Food Hygiene Rating Scheme API) | initial seed source | ✅ planned |
| `Ministry of Housing, Communities and Local Government` (Planning Data) | initial seed source | ✅ planned |
| `Welsh Government` (StatsWales) | initial seed source | ✅ planned |
| `Charity Commission` (register of charities data extract) | initial seed source | ✅ planned |
| `The National Archives` (Discovery API) | initial seed source | ✅ planned |
| `UK Health Security Agency` (UKHSA data dashboard API) | initial seed source | ✅ planned |
<!-- SEED-SOURCES -->

## Candidate seeds from public-apis

`reports/public-apis-candidates.md` holds UK entries from
[public-apis/public-apis](https://github.com/public-apis/public-apis) that this
readme does not already carry: Postcodes.io, the UK Companies House API, NHS
Scotland open data, the UK Police data API, and the TfL API among them. Several
already sit in the planned table above, so the report is a shortlist to work
through rather than a queue of new work. Regenerate it with the command in
`reports/README.md`.

Projects run `pnpm run setup` to list their own initial sources here; the
scraper framework in `src/lib/scrapers/` turns each into a `Scraper`.

## Best-effort (fetched, no structured extraction yet)

| Source | What we want | Status |
| --- | --- | --- |
| _(add sources here as scrapers land)_ | | ⚠️ |

## Key-gated (enable via env)

| Source | Env var | Notes |
| --- | --- | --- |
| _(add keyed APIs here, e.g. Eventfinda/Meetup)_ | `..._API_KEY` | Free key at the provider portal |

## Planned

- Real scrapers for the project's seed sources, replacing the example
- Headless-browser fallback for JS-rendered listing pages
- Enrichment passes (socials, contact, coordinates) with sources per field

## Rules

- Respect `robots.txt` (enforced in `src/lib/scrapers/http.ts`)
- 500ms+ delay between requests per source
- 15s request timeout; failures are recorded, never fatal
- No paywalled, logged-in, or private data. Ever.
- Update this table when a source changes status: it is the project's
  transparency record.

## How listings are re-verified

`scripts/check-item-urls.mjs` (`pnpm run check:item-urls`) fetches the
`website` and `source.url` of every listing and exits non-zero on a dead link.
The grow loop runs it before each batch: sources that answer get `lastVerified`
rolled forward, and a source that fails is either re-pointed at the live page
or marked `verified: false` with a `notes` reason explaining why. A 403 from a
bot-protected site counts as live, because the server is up and refusing this
client, not gone.

It sits outside `pnpm run check` on purpose: the gate has to pass on an
offline clone and in CI, so no check in that chain may need the network.
