import { describe, expect, it } from 'vitest';
import { seedItems } from '@/data/items';
import { itemListSchema } from '@/data/schema';

describe('seed dataset integrity', () => {
  it('passes zod validation including slug-id equality and date ranges', () => {
    expect(itemListSchema.safeParse(seedItems).success).toBe(true);
  });

  it('has unique ids and names', () => {
    expect(new Set(seedItems.map((item) => item.id)).size).toBe(seedItems.length);
    expect(new Set(seedItems.map((item) => item.name)).size).toBe(seedItems.length);
  });

  it('requires a source with a URL on every item', () => {
    for (const item of seedItems) {
      expect(item.source.label.length).toBeGreaterThan(0);
      expect(item.source.url.startsWith('https://')).toBe(true);
    }
  });

  it('requires lastVerified in YYYY-MM-DD format', () => {
    for (const item of seedItems) {
      expect(item.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('keeps calendar date ranges consistent', () => {
    for (const item of seedItems) {
      for (const date of item.calendarDates) {
        expect(date.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (date.end) expect(date.end >= date.start).toBe(true);
      }
    }
  });

  it('marks at least one seed item as stale for UI coverage', () => {
    expect(seedItems.some((item) => item.lastVerified < '2026-01-01')).toBe(true);
  });
});

describe('item schema validation', () => {
  it('rejects a mismatched id and slug', () => {
    const result = itemListSchema.safeParse([{ ...seedItems[0], slug: 'different-slug' }]);
    expect(result.success).toBe(false);
  });

  it('rejects a calendar end before its start', () => {
    const result = itemListSchema.safeParse([
      { ...seedItems[0], calendarDates: [{ start: '2026-09-10', end: '2026-09-01' }] },
    ]);
    expect(result.success).toBe(false);
  });
});
