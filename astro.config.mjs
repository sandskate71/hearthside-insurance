// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nashvilleinsuranceadvisors.com',
  redirects: {
    '/services/life-annuities': '/services/life-insurance',
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/blog/placeholder') &&
        !page.includes('/nashville-business-stories/placeholder'),
    }),
  ],
});