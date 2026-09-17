import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedItems } from '@/data/items';
import { resetSnapshotCache } from '@/lib/db';
import {
  getItemById,
  listCategories,
  listCities,
  listItems,
  listSources,
  recordItemView,
  recordSearch,
  setItemOptOut,
} from '@/lib/item-repository';

describe('item repository (snapshot mode)', () => {
  afterEach(() => {
    resetSnapshotCache();
    delete process.env.DATABASE_URL;
    vi.restoreAllMocks();
  });

  it('lists items with filters and pagination', async () => {
    const all = await listItems({ limit: 200 });
    expect(all.length).toBe(seedItems.length);
    const city = await listItems({ city: seedItems[0].city });
    expect(city.every((item) => item.city === seedItems[0].city)).toBe(true);
    const category = await listItems({ category: seedItems[0].categories[0] });
    expect(category.every((item) => item.categories.includes(seedItems[0].categories[0]))).toBe(
      true
    );
    const page = await listItems({ limit: 1, offset: 0 });
    expect(page.length).toBe(1);
  });

  it('fetches one public item and returns null for opt-outs', async () => {
    expect((await getItemById(seedItems[0].id))?.id).toBe(seedItems[0].id);
    expect(await getItemById('nope')).toBeNull();
  });

  it('aggregates cities, categories and sources', async () => {
    const cities = await listCities();
    expect(cities.find((c) => c.city === seedItems[0].city)?.count).toBeGreaterThan(0);
    const categories = await listCategories();
    expect(categories.some((c) => c.category === seedItems[0].categories[0])).toBe(true);
    const sources = await listSources();
    expect(sources).toContain(seedItems[0].source.label);
  });

  it('records analytics to stdout in snapshot mode', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await recordItemView(seedItems[0].id);
    await recordSearch('test', 2);
    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('records an opt-out request and reports existing listings', async () => {
    expect(await setItemOptOut(seedItems[0].id)).toBe(true);
    expect(await setItemOptOut('missing')).toBe(false);
  });
});
