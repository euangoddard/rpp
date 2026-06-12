import { readFileSync } from "node:fs";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { createSearchEngine } from "./worker/search.js";

// In production the /api/search route is handled by the Cloudflare Worker
// (worker/index.ts). This plugin provides the same endpoint during `astro dev`
// using the same search engine and the index emitted by `npm run index-recipes`.
function devSearchApi() {
  let search;
  return {
    name: "dev-search-api",
    configureServer(server) {
      server.middlewares.use("/api/search", (req, res) => {
        if (!search) {
          const data = JSON.parse(
            readFileSync(
              new URL("./worker/search-data.json", import.meta.url),
              "utf-8",
            ),
          );
          search = createSearchEngine(data);
        }
        const query =
          new URL(req.url ?? "/", "http://localhost").searchParams.get("q") ??
          "";
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ results: search(query) }));
      });
    },
  };
}

export default defineConfig({
  site: "https://recipes.euans.space",
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss(), devSearchApi()],
  },
});
