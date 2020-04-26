import { createSelector } from '@ngrx/store';
import { sortBy, values } from 'lodash-es';
import { RppState } from 'src/app/reducers';
import { RecipesState } from 'src/app/reducers/recipes';

const selectRecipesState = (state: RppState) => state.recipes;

export const selectRecipesList = createSelector(
  selectRecipesState,
  (state: RecipesState, props: { category?: string | null }) => {
    const category = props?.category;
    let recipes = values(state.recipes);
    if (category) {
      recipes = recipes.filter((r) =>
        r.categories.includes(category as string)
      );
    }
    return sortBy(recipes, 'title');
  }
);

export const selectRecipesById = createSelector(
  selectRecipesState,
  (state: RecipesState) => {
    return state.recipes;
  }
);

export const selectRecipe = createSelector(
  selectRecipesState,
  (state: RecipesState, props: { recipeId: string }) => {
    return state.recipes[props.recipeId];
  }
);
