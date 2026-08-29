import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/site-config';

/**
 * Robots.txt: public pages are indexable, the admin refresh endpoint and
 * view tracker are not.
 */
export default function robots(): MetadataRoute.Robots {
  const config = getSiteConfig();
  const baseUrl = config.baseUrl || 'https://example.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/cron/',
          '/api/items/',
          '/api/opt-out',
          '/api/subscribe',
          '/api/unsubscribe',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
