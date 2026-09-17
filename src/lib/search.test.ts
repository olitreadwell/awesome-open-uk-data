import { describe, expect, it } from 'vitest';
import { seedItems } from '@/data/items';
import { searchItems } from '@/lib/search';

describe('searchItems', () => {
  it('ranks name matches above description matches', () => {
    const query = seedItems[0].name;
    const results = searchItems(seedItems, query);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain(query);
  });

  it('matches categories and locations', () => {
    expect(searchItems(seedItems, seedItems[0].categories[0]).length).toBeGreaterThan(0);
    expect(
      searchItems(seedItems, seedItems[0].location ?? seedItems[0].name).length
    ).toBeGreaterThan(0);
  });

  it('returns everything on an empty query', () => {
    expect(searchItems(seedItems, '  ').length).toBe(seedItems.length);
  });

  it('excludes opted-out items from results', () => {
    const items = [{ ...seedItems[0], optOut: true }];
    expect(searchItems(items, seedItems[0].name)).toEqual([]);
  });
});
