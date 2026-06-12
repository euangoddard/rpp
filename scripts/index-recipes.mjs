import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import glob from "fast-glob";
import frontMatter from "front-matter";

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, "../worker/search-data.json");

const files = await glob([resolve(here, "../src/content/recipes/*.md")], {
  dot: true,
});

const documents = [];
for (const path of files.sort()) {
  const content = await readFile(path, "utf-8");
  const { attributes, body } = frontMatter(content);
  documents.push({
    id: attributes.slug,
    title: attributes.title,
    tags: attributes.tags.join(" "),
    body: extractUniqueWords(body),
  });
}

await writeFile(outputPath, JSON.stringify(documents), "utf-8");
console.log(`Indexing done - ${documents.length} recipes found.`);

// The search index only needs to know whether a word occurs in a recipe, so
// deduplicating words keeps the Worker bundle small.
function extractUniqueWords(body) {
  const words = body
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  return [...new Set(words)].join(" ");
}
