// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { BRAND } from './src/consts.ts';

// https://astro.build/config
export default defineConfig({
  site: BRAND.url,
  redirects: {
    '/services/life-annuities': '/services/life-insurance',
    '/faq': '/ask',
    '/faq/': '/ask',
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/blog/placeholder') &&
        !page.includes('/nashville-business-stories/placeholder'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});