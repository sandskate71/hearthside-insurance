// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { BRAND } from './src/consts.ts';

// Thin near-duplicate city pages, noindexed pending a rewrite to the
// Brentwood standard. Source and URLs stay live — this is reversible.
const CONSOLIDATED_CITY_PAGES = [
  'bellevue',
  'green-hills',
  'hendersonville',
  'hermitage',
  'mount-juliet',
  'murfreesboro',
  'nolensville',
  'spring-hill',
];

// https://astro.build/config
export default defineConfig({
  site: BRAND.url,
  // Redirects live in public/_redirects so Cloudflare Pages issues real 301s.
  // Astro's `redirects` config emits static meta-refresh pages on a static build,
  // and a static asset shadows any _redirects rule for the same path.
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/blog/placeholder') &&
        !page.includes('/nashville-business-stories/placeholder') &&
        // Medicare assets are noindexed pending FMO pre-clearance.
        // Remove these three lines the day written clearance lands.
        !page.includes('/services/medicare') &&
        !page.includes('/blog/medicare-65-what-to-do-six-months-before') &&
        !page.includes('/blog/medicare-open-enrollment-annual-review-nashville') &&
        // Placeholder hub: out of the sitemap and unlinked from the footer
        // until the first story ships. The URL stays live.
        !/\/nashville-business-stories\/?$/.test(page) &&
        // The eight thin city pages carry `noindex,follow` (see
        // NeighborhoodPage.astro). Brentwood and Franklin stay indexed.
        // Reversible: delete this line and drop `noindexFollow` from the pages.
        !CONSOLIDATED_CITY_PAGES.some((city) => page.includes(`/neighborhoods/${city}`)),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});