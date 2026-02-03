import { defineCollection, z } from 'astro:content';

/**
 * Projects collection: one Markdown file per project.
 * Add a new project by creating a new .md file in src/content/projects/.
 */
const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    link: z.string().url().optional(),
  }),
});

/**
 * Optional: blog collection for future use.
 * When you add a Blog section, create src/content/blog/*.md and use this.
 */
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  projects: projectsCollection,
  blog: blogCollection,
};
