import { usePersistedState } from "../lib/hooks";
import type { RecipePointer, RecipePointers } from "../lib/models";
import { pullRecipeFromCollection } from "../lib/recipe-collection";
import { StarIcon } from "./icons";

export default function StarredRecipes() {
  const [recipes, setRecipes] = usePersistedState<RecipePointers>(
    "starredRecipes",
    [],
  );

  const unstarRecipe = (recipe: RecipePointer): void => {
    setRecipes(pullRecipeFromCollection(recipes, recipe));
  };

  return (
    <section class="mb-10">
      <h2 class="border-line mb-4 border-b pb-2 text-2xl">Starred</h2>
      {recipes.length ? (
        <ol class="space-y-2.5">
          {recipes.map((recipe) => (
            <li key={recipe.url} class="flex items-center gap-1">
              <a
                href={recipe.url}
                class="text-accent underline-offset-2 hover:underline"
              >
                {recipe.title}
              </a>
              <button
                type="button"
                class="star-button starred"
                aria-label={`Unstar ${recipe.title}`}
                onClick={() => unstarRecipe(recipe)}
              >
                <StarIcon class="size-4.5" filled />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p class="text-ink-soft">Tap the star on any recipe to pin it here.</p>
      )}
    </section>
  );
}
