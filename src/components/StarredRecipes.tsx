import { usePersistedState } from "../lib/hooks";
import type { RecipePointer, RecipePointers } from "../lib/models";
import { pullRecipeFromCollection } from "../lib/recipe-collection";

export default function StarredRecipes() {
  const [recipes, setRecipes] = usePersistedState<RecipePointers>(
    "starredRecipes",
    []
  );

  const unstarRecipe = (recipe: RecipePointer): void => {
    setRecipes(pullRecipeFromCollection(recipes, recipe));
  };

  return (
    <div>
      <h2>Starred recipes</h2>
      {recipes.length ? (
        <ol>
          {recipes.map((recipe) => (
            <li>
              <span style="display: inline-flex; align-items: center;">
                <a href={recipe.url}>{recipe.title}</a>
                <button
                  type="button"
                  class="star-button starred"
                  onClick={() => unstarRecipe(recipe)}
                >
                  <span class="material-icons">star</span>
                </button>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p>
          <em>No starred recipes</em>
        </p>
      )}
    </div>
  );
}
