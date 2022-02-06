import { useEffect } from "preact/hooks";
import { usePersistedState } from "../lib/hooks";
import type { RecipePointer, RecipePointers } from "../lib/models";
import { pushRecipeToCollection } from "../lib/recipe-collection";

export interface StoreRecentRecipeProps {
  recipe: RecipePointer;
}

export default function StoreRecentRecipe({ recipe }: StoreRecentRecipeProps) {
  const [recipes, setRecipes] = usePersistedState<RecipePointers>(
    "recentRecipes",
    []
  );
  useEffect(() => {
    setRecipes(pushRecipeToCollection(recipes, recipe).slice(0, 5));
  }, []);
  return <></>;
}
