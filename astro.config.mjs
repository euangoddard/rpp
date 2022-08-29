import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [preact()],
  site: "https://recipes-plus-plus.netlify.app",
});
