// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { BRAND } from './src/consts.ts';

// Eight thin near-duplicate city pages were consolidated into
// /neighborhoods/. They now 301 there from public/_redirects and no longer
// build: their sources sit in src/pages/neighborhoods/_archive/, where the
// leading underscore keeps Astro from generating routes. Source is retained
// for a future rebuild to the Brentwood standard — move a file back out of
// _archive/ and drop its _redirects line to restore it.
//
// They previously carried `noindex,follow` and were filtered out of the
// sitemap here. Both are now dead: a page that does not build cannot be
// indexed or listed, and the 301 is the consolidation signal.

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
        !/\/nashville-business-stories\/?$/.test(page),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});