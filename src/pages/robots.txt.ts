import type { APIRoute } from 'astro';
import { BRAND } from '../consts';

const body = `User-agent: *
Allow: /

Sitemap: ${BRAND.url}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
