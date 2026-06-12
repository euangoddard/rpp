# recipes++

A personal recipe collection at [recipes.euans.space](https://recipes.euans.space).

Built with [Astro 6](https://astro.build) (static output) and Preact islands,
styled with [Tailwind CSS v4](https://tailwindcss.com), and deployed as a
[Cloudflare Worker](https://developers.cloudflare.com/workers/) that serves the
prebuilt site via Workers Static Assets and handles search at `/api/search`.

## Project structure

```
/
├── public/                  # static files (icons, manifest)
├── scripts/
│   └── index-recipes.mjs    # builds worker/search-data.json from the recipes
├── src/
│   ├── components/          # Astro components + Preact islands
│   ├── content/recipes/     # the recipes (markdown content collection)
│   ├── content.config.ts    # collection schema
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/global.css    # Tailwind theme + cookbook styles
├── worker/
│   ├── index.ts             # Cloudflare Worker entry (assets + /api/search)
│   ├── search.js            # FlexSearch engine shared with dev middleware
│   └── search-data.json     # generated search index (gitignored)
└── wrangler.jsonc           # Worker + static assets + custom domain config
```

## Search

`npm run index-recipes` extracts title, tags, and deduplicated body words from
every recipe into `worker/search-data.json`. The Worker builds a
[FlexSearch](https://github.com/nextapps-de/flexsearch) index from it at
startup and serves `GET /api/search?q=…`. During `astro dev` the same engine is
exposed by a Vite middleware (see `astro.config.mjs`), so search works locally
too. The index script runs automatically before `dev` and `build`.

## Commands

| Command              | Action                                           |
| :------------------- | :----------------------------------------------- |
| `npm install`        | Install dependencies                             |
| `npm run dev`        | Start the dev server at `localhost:4321`         |
| `npm run build`      | Build the search index and site into `./dist/`   |
| `npm run preview`    | Build, then serve the real Worker via `wrangler` |
| `npm run deploy`     | Build and deploy to Cloudflare                   |
| `npm run cf-typegen` | Regenerate Worker types (`worker-configuration`) |

## Adding a recipe

Drop a markdown file in `src/content/recipes/` with frontmatter:

```yaml
---
title: Brownies
slug: brownies # becomes /recipes/<slug>
serves: 16
tags:
  - Baking
prep: 20 min # optional
cook: 30 min # optional
source: https://… # optional
---
```

followed by `## Ingredients` and `## Method` sections.
