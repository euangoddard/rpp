import { usePersistedState } from "../lib/hooks";
import type { RecipePointer, RecipePointers } from "../lib/models";
import {
  hasCollectionRecipe,
  pullRecipeFromCollection,
  pushRecipeToCollection,
} from "../lib/recipe-collection";

interface StarRecipeProps {
  recipe: RecipePointer;
}

export default function StarRecipe({ recipe }: StarRecipeProps) {
  const [recipes, setRecipes] = usePersistedState<RecipePointers>(
    "starredRecipes",
    []
  );

  const isStarred = hasCollectionRecipe(recipes, recipe);

  const setIsStarred = (value: boolean): void => {
    let starredRecipes: RecipePointers;
    if (value) {
      starredRecipes = pushRecipeToCollection(recipes, recipe);
    } else {
      starredRecipes = pullRecipeFromCollection(recipes, recipe);
    }
    setRecipes(starredRecipes);
  };

  const starButton = (
    <button type="button" onClick={() => setIsStarred(true)}>
      <span class="material-icons">star</span>
    </button>
  );

  const unstarButton = (
    <button type="button" onClick={() => setIsStarred(false)}>
      <span class="material-icons">star_outline</span>
    </button>
  );

  return isStarred ? unstarButton : starButton;
}
