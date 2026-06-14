import { Document, Encoder } from "flexsearch";

const FIELD_WEIGHTS: Record<string, number> = { title: 10, body: 3, tags: 1 };
const RESULT_LIMIT = 20;

interface RecipeDocument {
  id: string;
  title: string;
  tags: string;
  body: string;
  [key: string]: string;
}

interface RecipeResult {
  url: string;
  title: string;
  score: number;
}

export function createSearchEngine(
  documents: readonly RecipeDocument[],
): (query: string) => RecipeResult[] {
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
  const titles = new Map<string, string>();
  for (const doc of documents) {
    index.add(doc);
    titles.set(doc.id, doc.title);
  }

  return (query: string): RecipeResult[] => {
    if (!query?.trim()) {
      return [];
    }
    const fieldResults = index.search(query, {
      suggest: true,
      limit: RESULT_LIMIT,
    });
    const scores = new Map<string, number>();
    for (const { field, result } of fieldResults) {
      const weight = (field != null ? FIELD_WEIGHTS[field] : undefined) ?? 1;
      result.forEach((id, position) => {
        if (id == null) return;
        const key = String(id);
        const score = weight * (1 - position / RESULT_LIMIT);
        scores.set(key, (scores.get(key) ?? 0) + score);
      });
    }
    return [...scores.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, RESULT_LIMIT)
      .map(([id, score]) => ({
        url: `/recipes/${id}`,
        title: titles.get(id)!,
        score,
      }));
  };
}
