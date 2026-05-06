import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('Enrique Gandara'),
    category: z.enum([
      'Home & Auto',
      'Small Business',
      'Life & Annuities',
      'Long-Term Care',
      'Medicare',
      'Insurance Basics',
      'Nashville',
      'General',
    ]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const businessStories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/business-stories' }),
  schema: z.object({
    businessName: z.string(),
    tagline: z.string(),
    description: z.string(),
    funFacts: z.array(z.string()),
    websiteUrl: z.string().url(),
    youtubeVideoId: z.string(),
    featured: z.boolean().default(false),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog, businessStories };
