import { createSearchEngine } from "./search.ts";
import searchData from "./search-data.json";

const search = createSearchEngine(searchData);

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/search") {
      const query = url.searchParams.get("q") ?? "";
      return Response.json(
        { results: search(query) },
        {
          headers: {
            // The index only changes on deploy, so results can be cached.
            "Cache-Control": "public, max-age=3600",
          },
        },
      );
    }
    // Anything else that reaches the Worker missed the static assets; let the
    // assets handler apply its configured 404 behaviour.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
