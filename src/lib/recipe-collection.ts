import { RecipePointer, RecipePointers } from "./models";

export const pushRecipeToCollection = (
  recipes: RecipePointers,
  recipe: RecipePointer
): RecipePointers => {
  return [recipe, ...pullRecipeFromCollection(recipes, recipe)];
};

export const pullRecipeFromCollection = (
  recipes: RecipePointers,
  recipe: RecipePointer
): RecipePointers => {
  return recipes.filter(({ url }) => url !== recipe.url);
};

export const hasCollectionRecipe = (
  recipes: RecipePointers,
  recipe: RecipePointer
): boolean => !!recipes.find(({ url }) => url === recipe.url);
