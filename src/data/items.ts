import { itemListSchema, type Item } from '@/data/schema';

/**
 * Seed dataset for the template itself: three obviously-placeholder listings
 * so every page, feed and API endpoint renders real-shaped data before a
 * project scrapes its own. Replace with real listings — `pnpm run setup`
 * and TEMPLATE_USAGE.md both explain how, and `scripts/build-snapshot.mjs`
 * regenerates `src/data/snapshot.json` from this file.
 */
const rawItems = [
  {
    id: 'example-place-one',
    slug: 'example-place-one',
    name: 'Example Place One',
    city: 'Wellington',
    region: 'Wellington region',
    location: 'CBD',
    lat: -41.2904,
    lng: 174.7787,
    description:
      'Placeholder listing proving the template pipeline: replace this file with real data.',
    categories: ['example'],
    website: 'https://example.com',
    source: { label: 'Template seed data', url: 'https://example.com' },
    lastVerified: '2026-08-01',
    verified: false,
  },
  {
    id: 'example-place-two',
    slug: 'example-place-two',
    name: 'Example Place Two',
    city: 'Wellington',
    region: 'Wellington region',
    location: 'Te Aro',
    lat: -41.2939,
    lng: 174.7826,
    description: 'Second placeholder listing with calendar dates for the iCal feed.',
    categories: ['example', 'family'],
    website: 'https://example.com',
    source: { label: 'Template seed data', url: 'https://example.com' },
    lastVerified: '2026-08-01',
    verified: false,
    calendarDates: [{ start: '2026-09-05', label: 'Market day' }],
  },
  {
    id: 'example-place-three',
    slug: 'example-place-three',
    name: 'Example Place Three',
    city: 'Lower Hutt',
    region: 'Wellington region',
    location: 'Petone',
    lat: -41.2256,
    lng: 174.8735,
    description: 'Third placeholder listing outside the start city.',
    categories: ['example', 'thrift'],
    website: 'https://example.com',
    source: { label: 'Template seed data', url: 'https://example.com' },
    lastVerified: '2025-01-15',
    verified: false,
  },
] as const;

/** Validated seed listings, exported for tests and the snapshot builder. */
export const seedItems: Item[] = itemListSchema.parse(rawItems);
