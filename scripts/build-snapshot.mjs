#!/usr/bin/env node
// Regenerates src/data/snapshot.json from the validated seed in src/data/items.ts.
// The snapshot is the committed artifact every read path serves in snapshot mode.
//
// The export timestamp only moves when the dataset content moves. A rewrite on
// every run (with a fresh `new Date()`) leaves the tree dirty after every
// `pnpm run check`, and the daily grow loop reads a dirty tree as a locked one
// and skips. Identical items therefore reuse the committed `exportedAt`.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { format } from 'prettier';

// Load the TS seed through tsx so this script needs no separate build step.
const out = execFileSync(
  process.execPath,
  [
    '--import',
    'tsx',
    '--eval',
    `
    import { seedItems } from ${JSON.stringify(new URL('../src/data/items.ts', import.meta.url).href)};
    process.stdout.write(JSON.stringify({
      license: "Public data only. Opt-out respected: see /opt-out.",
      items: seedItems.map((i) => ({
        ...i,
        categories: i.categories ?? [],
        verified: i.verified ?? false,
        active: i.active ?? true,
        optOut: i.optOut ?? false,
        calendarDates: i.calendarDates ?? [],
      })),
    }));
  `,
  ],
  { encoding: 'utf8' }
);

const snapshotPath = new URL('../src/data/snapshot.json', import.meta.url);
const { license, items } = JSON.parse(out);
const existing = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, 'utf8'))
  : undefined;
const itemsUnchanged =
  existing !== undefined && JSON.stringify(existing.items) === JSON.stringify(items);

const exportBody = {
  version: 'seed',
  exportedAt: itemsUnchanged ? existing.exportedAt : new Date().toISOString(),
  license,
  items,
};
const formatted = await format(JSON.stringify(exportBody, null, 2), { parser: 'json' });

if (itemsUnchanged && readFileSync(snapshotPath, 'utf8') === formatted) {
  console.log(`Snapshot unchanged (prettier-formatted): ${snapshotPath.pathname}`);
} else {
  writeFileSync(snapshotPath, formatted);
  console.log(`Snapshot written (prettier-formatted): ${snapshotPath.pathname}`);
}
