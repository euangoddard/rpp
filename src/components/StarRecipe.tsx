import { usePersistedState } from "../lib/hooks";
import type { RecipePointer, RecipePointers } from "../lib/models";
import {
  hasCollectionRecipe,
  pullRecipeFromCollection,
  pushRecipeToCollection,
} from "../lib/recipe-collection";
import { StarIcon } from "./icons";

interface StarRecipeProps {
  recipe: RecipePointer;
}

export default function StarRecipe({ recipe }: StarRecipeProps) {
  const [recipes, setRecipes] = usePersistedState<RecipePointers>(
    "starredRecipes",
    [],
  );

  const isStarred = hasCollectionRecipe(recipes, recipe);

  const toggleStarred = (): void => {
    setRecipes(
      isStarred
        ? pullRecipeFromCollection(recipes, recipe)
        : pushRecipeToCollection(recipes, recipe),
    );
  };

  return (
    <button
      type="button"
      class={`star-button ${isStarred ? "starred" : ""}`}
      aria-label={isStarred ? "Unstar this recipe" : "Star this recipe"}
      onClick={toggleStarred}
    >
      <StarIcon class="size-6" filled={isStarred} />
    </button>
  );
}
