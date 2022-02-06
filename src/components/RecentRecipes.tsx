import { usePersistedState } from "../lib/hooks";
import type { RecipePointers } from "../lib/models";

export default function RecentRecipes() {
  const [recipes] = usePersistedState<RecipePointers>("recentRecipes", []);
  return (
    <div>
      <h2>Recently viewed recipes</h2>
      {recipes.length ? (
        <ol>
          {recipes.map((recipe) => (
            <li>
              <a href={recipe.url}>{recipe.title}</a>
            </li>
          ))}
        </ol>
      ) : (
        <p>
          <em>No recent recipes</em>
        </p>
      )}
    </div>
  );
}
