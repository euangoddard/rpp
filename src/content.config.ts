import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const recipes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/recipes" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    serves: z.union([z.string(), z.number()]),
    tags: z.array(z.string()).default([]),
    prep: z.string().optional(),
    cook: z.string().optional(),
    source: z.url().optional(),
  }),
});

export const collections = { recipes };
