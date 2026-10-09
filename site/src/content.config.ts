import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { findUnpaired } from './lib/pairing';

const base = glob({ pattern: '**/*.md', base: './src/content/projects' });

const projects = defineCollection({
  // Wrap the glob loader so an EN project without its ZH twin (or vice versa) fails the build here,
  // before any page renders — spec §7.
  loader: {
    name: 'projects-paired',
    load: async (ctx) => {
      await base.load(ctx);
      const orphans = findUnpaired([...ctx.store.keys()]);
      if (orphans.length) {
        throw new Error(
          `projects: missing locale twin for ${orphans.join(', ')} — every en/*.md needs a zh/*.md with the same name`,
        );
      }
    },
  },
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      category: z.enum(['product', 'data']),
      role: z.string(),
      period: z.string(),
      stack: z.array(z.string()).min(1),
      scale: z.array(z.string()).min(1),
      links: z.object({ github: z.string().url().optional(), live: z.string().url().optional() }).default({}),
      featured: z.boolean().default(true),
      order: z.number().int(),
      waffle: z
        .object({ source: z.literal('github'), repo: z.string() })
        .or(z.object({ source: z.literal('static'), cols: z.number().int(), cells: z.array(z.number().int().min(0).max(4)) }))
        .optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string() })).default([]),
    }),
});

export const collections = { projects };
