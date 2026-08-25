// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { BRAND } from './src/consts.ts';

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
        !page.includes('/blog/medicare-open-enrollment-annual-review-nashville'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});