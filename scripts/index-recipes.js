const frontMatter = require("front-matter");
const { readFile, writeFile } = require("fs/promises");
const { resolve } = require("path");
const glob = require("fast-glob");
const lunr = require("lunr");

(async () => {
  const files = await glob([resolve(__dirname, "../src/pages/recipes/*.md")], {
    dot: true,
  });
  const recipes = [];
  const recipesMeta = {};
  for (const path of files) {
    const content = await readFile(path, "utf-8");
    const data = frontMatter(content);
    const { attributes, body } = data;
    recipes.push({
      title: attributes.title,
      slug: attributes.slug,
      body,
      categories: attributes.tags.join(" "),
    });
    recipesMeta[attributes.slug] = attributes.title;
  }
  const index = buildIndex(recipes);
  await writeFile(
    resolve(__dirname, "../functions/search-index.json"),
    JSON.stringify({ index: index.toJSON(), metadata: recipesMeta }),
    "utf-8"
  );

  console.log(`Indexing done - ${recipes.length} recipes found.`);
})();

function buildIndex(recipes) {
  return lunr(function () {
    this.ref("slug");
    this.field("title", { boost: 10 });
    this.field("body", { boost: 3 });
    this.field("categories", { boost: 1 });
    for (const recipe of recipes) {
      this.add(recipe);
    }
  });
}
