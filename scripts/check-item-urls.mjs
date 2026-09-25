#!/usr/bin/env node
// Liveness pass over every dataset listing's public URLs (website + source).
// The grow loop runs this before adding items: a listing whose publisher URL
// no longer answers is either fixed or flagged `verified: false` with a reason,
// so the committed dataset never points readers at a dead page.
//
// This is deliberately separate from scripts/check-external-links.mjs, which is
// the offline JSX rule (target="_blank" + rel="noopener noreferrer") that runs
// inside `pnpm run check`. A checker that needs the network must not sit in a
// gate that CI and offline clones have to pass.
import { execFileSync } from 'node:child_process';

/** Milliseconds between two requests to the same origin. */
const PER_ORIGIN_DELAY_MS = 500;

/** Per-request timeout, in milliseconds. */
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Attempts per URL before a network-level failure counts as dead. Some
 * publishers (Public Health Scotland among them) reset a share of TLS
 * connections while answering others, so one reset is not evidence of a dead
 * source. HTTP status codes are never retried: only thrown fetch errors are.
 */
const NETWORK_ATTEMPTS = 3;

/** Delay before the first retry, in milliseconds; doubles for each later retry. */
const RETRY_BACKOFF_MS = 1000;

/** User agent for the check: identifies the repo so a publisher can see who asked. */
const CHECK_USER_AGENT =
  'Mozilla/5.0 (compatible; AwesomeOpenUKDataLinkCheck/1.0; +https://github.com/olitreadwell/awesome-open-uk-data)';

/**
 * Status codes treated as "the publisher still answers". 403/405/429 mean the
 * server is up but refuses this client: bot protection or a HEAD refusal, not
 * a dead source.
 */
const LIVE_STATUSES = new Set([200, 201, 202, 203, 204, 301, 302, 307, 308]);

/** Status codes that mean the source is gone, even though the server answered. */
const DEAD_STATUSES = new Set([404, 410, 451]);

/** Loads the validated seed items through tsx, so this script needs no build step. */
function loadSeedItems() {
  const script = `
    import { seedItems } from ${JSON.stringify(new URL('../src/data/items.ts', import.meta.url).href)};
    process.stdout.write(JSON.stringify(seedItems.map((item) => ({
      id: item.id,
      name: item.name,
      verified: item.verified,
      lastVerified: item.lastVerified,
      urls: [...new Set([item.website, item.source?.url].filter(Boolean))],
    }))));
  `;
  const out = execFileSync(process.execPath, ['--import', 'tsx', '--eval', script], {
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

const lastRequestByOrigin = new Map();

/** Waits out the polite per-origin delay measured from the previous request. */
async function respectOriginDelay(origin) {
  const last = lastRequestByOrigin.get(origin) ?? 0;
  const wait = Math.max(0, PER_ORIGIN_DELAY_MS - (Date.now() - last));
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestByOrigin.set(origin, Date.now());
}

/**
 * Classifies one HTTP answer. Never retried, because a status code is the
 * publisher's answer rather than a failed connection.
 */
function classifyResponse(res) {
  if (LIVE_STATUSES.has(res.status)) {
    return { outcome: 'ok', status: res.status, detail: res.url };
  }
  if (DEAD_STATUSES.has(res.status)) {
    return { outcome: 'dead', status: res.status, detail: res.url };
  }
  if (res.status === 403 || res.status === 405 || res.status === 429) {
    return { outcome: 'blocked', status: res.status, detail: 'bot-protected, server is up' };
  }
  return { outcome: 'dead', status: res.status, detail: `${res.status} from publisher` };
}

/** One fetch attempt, with the polite per-origin delay observed first. */
async function fetchOnce(url, origin) {
  await respectOriginDelay(origin);
  return fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: { 'user-agent': CHECK_USER_AGENT, accept: 'text/html,*/*' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Probes one URL and classifies the answer. Connection-level failures are
 * retried, because a publisher that resets one TCP connection is usually still
 * up on the next.
 *
 * @param url - Absolute http(s) URL to probe
 * @returns `{ outcome, status, detail }`, where outcome is ok | blocked | dead
 */
async function probeUrl(url) {
  const origin = new URL(url).origin;
  let lastError;
  for (let attempt = 1; attempt <= NETWORK_ATTEMPTS; attempt += 1) {
    try {
      return classifyResponse(await fetchOnce(url, origin));
    } catch (error) {
      lastError = error;
      if (attempt < NETWORK_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS * 2 ** (attempt - 1)));
      }
    }
  }
  return {
    outcome: 'dead',
    status: 0,
    detail: `fetch failed after ${NETWORK_ATTEMPTS} attempts: ${lastError.message}`,
  };
}

const items = loadSeedItems();
const results = [];
let failures = 0;
let blocked = 0;

for (const item of items) {
  for (const url of item.urls) {
    const probe = await probeUrl(url);
    results.push({ itemId: item.id, url, ...probe });
    if (probe.outcome === 'dead') failures += 1;
    if (probe.outcome === 'blocked') blocked += 1;
  }
}

for (const entry of results) {
  const label = entry.outcome === 'ok' ? 'OK  ' : entry.outcome === 'blocked' ? 'BLOCK' : 'DEAD';
  console.log(`${label} ${entry.status || '---'} ${entry.itemId.padEnd(32)} ${entry.url}`);
  if (entry.outcome === 'dead') console.log(`      ${entry.detail}`);
}

console.log(
  `\n${results.length} URLs checked: ${
    results.length - failures - blocked
  } ok, ${blocked} bot-blocked but live, ${failures} dead`
);

if (failures > 0) {
  console.error(`\n${failures} listing URL(s) did not respond. Fix the URL, or set`);
  console.error('`verified: false` with a `notes` reason on the item and leave the');
  console.error('source in place: the grow loop never silently drops a source.');
  process.exit(1);
}
