import Link from 'next/link';
import { ItemCard } from '@/components/item-card';
import { SearchBox } from '@/components/search-box';
import { buildExportFromSource } from '@/lib/db';
import { countByCategory, countByCity } from '@/lib/dataset';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Home: hero with search, category and city browse, and recent listings.
 *
 * @returns The homepage
 */
export default async function HomePage(): Promise<React.ReactElement> {
  const config = getSiteConfig();
  const dataset = await buildExportFromSource();
  const recent = dataset.items.slice(0, 6);
  const categories = countByCategory(dataset.items).slice(0, 12);
  const cities = countByCity(dataset.items).slice(0, 8);
  return (
    <main className="space-y-10">
      <section className="space-y-4 py-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {config.thingPlural} in {config.city}
        </h1>
        <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-300">
          An open directory of {config.thingPlural} across {config.region}. Every listing carries a
          source and a last-verified date, so you can check before you rely on it.
        </p>
        <div className="flex justify-center">
          <SearchBox />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {dataset.items.length} {config.thingPlural} listed ·{' '}
          <Link href="/items" className="underline">
            browse all
          </Link>{' '}
          ·{' '}
          <Link href="/map" className="underline">
            map
          </Link>
        </p>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="mb-3 text-lg font-semibold">
            Browse by category
          </h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.category}>
                <Link
                  href={`/categories/${encodeURIComponent(category.category)}`}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {category.category} ({category.count})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cities.length > 0 ? (
        <section aria-labelledby="cities-heading">
          <h2 id="cities-heading" className="mb-3 text-lg font-semibold">
            Browse by city
          </h2>
          <ul className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <li key={city.city}>
                <Link
                  href={`/cities/${encodeURIComponent(city.city)}`}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {city.city} ({city.count})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="recent-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recent listings
          </h2>
          <Link href="/items" className="text-sm text-blue-600 underline dark:text-blue-400">
            See all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
