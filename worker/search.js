import { Document, Encoder } from "flexsearch";

// Mirrors the lunr boosts the original search lambda used.
const FIELD_WEIGHTS = { title: 10, body: 3, tags: 1 };
const RESULT_LIMIT = 20;

/**
 * @typedef {{ id: string; title: string; tags: string; body: string }} RecipeDocument
 * @typedef {{ url: string; title: string; score: number }} RecipeResult
 */

/**
 * Build an in-memory search index over the recipe documents and return a
 * query function. The corpus is small (~350 recipes) so indexing takes well
 * under the Worker startup CPU budget.
 *
 * @param {readonly RecipeDocument[]} documents
 * @returns {(query: string) => RecipeResult[]}
 */
export function createSearchEngine(documents) {
  const index = new Document({
    tokenize: "forward",
    // The encoder cache schedules a setTimeout, which the Workers runtime
    // disallows at global scope where this index is built.
    encoder: new Encoder({ cache: false }),
    document: {
      id: "id",
      index: ["title", "body", "tags"],
    },
  });
  const titles = new Map();
  for (const doc of documents) {
    index.add(doc);
    titles.set(doc.id, doc.title);
  }

  return (query) => {
    if (!query?.trim()) {
      return [];
    }
    const fieldResults = index.search(query, {
      suggest: true,
      limit: RESULT_LIMIT,
    });
    const scores = new Map();
    for (const { field, result } of fieldResults) {
      const weight = FIELD_WEIGHTS[field] ?? 1;
      result.forEach((id, position) => {
        const score = weight * (1 - position / RESULT_LIMIT);
        scores.set(id, (scores.get(id) ?? 0) + score);
      });
    }
    return [...scores.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, RESULT_LIMIT)
      .map(([id, score]) => ({
        url: `/recipes/${id}`,
        title: titles.get(id),
        score,
      }));
  };
}
