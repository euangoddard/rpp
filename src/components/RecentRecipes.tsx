import { usePersistedState } from "../lib/hooks";
import type { RecipePointers } from "../lib/models";

export default function RecentRecipes() {
  const [recipes] = usePersistedState<RecipePointers>("recentRecipes", []);
  return (
    <section class="mb-10">
      <h2 class="border-line mb-4 border-b pb-2 text-2xl">Recently viewed</h2>
      {recipes.length ? (
        <ol class="space-y-2.5">
          {recipes.map((recipe) => (
            <li key={recipe.url}>
              <a
                href={recipe.url}
                class="text-accent underline-offset-2 hover:underline"
              >
                {recipe.title}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p class="text-ink-soft">Recipes you open will show up here.</p>
      )}
    </section>
  );
}
