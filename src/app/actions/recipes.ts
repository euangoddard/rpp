import { createAction, props } from '@ngrx/store';
import { Recipe, Recipes } from 'src/app/models/recipe';

const PREFIX = '[Recipes]';

export const loadRecipesList = createAction(`${PREFIX} Load list`);
export const loadRecipesListSuccess = createAction(
  `${PREFIX} Load list success`,
  props<{ recipes: Recipes }>()
);
export const loadRecipesListError = createAction(
  `${PREFIX} Load list error`,
  props<{ error: string }>()
);

export const loadRecipe = createAction(
  `${PREFIX} Load one`,
  props<{ id: string }>()
);
export const loadRecipeSuccess = createAction(
  `${PREFIX} Load one success`,
  props<{ recipe: Recipe }>()
);
export const loadRecipeError = createAction(
  `${PREFIX} Load one error`,
  props<{ error: string }>()
);

export const saveRecipe = createAction(
  `${PREFIX} Save`,
  props<{ recipe: Recipe }>()
);
export const saveRecipeSuccess = createAction(
  `${PREFIX} Save one success`,
  props<{ recipe: Recipe }>()
);
export const saveRecipeError = createAction(
  `${PREFIX} Save one error`,
  props<{ error: string }>()
);

export const deleteRecipe = createAction(
  `${PREFIX} Delete`,
  props<{ recipe: Recipe }>()
);
export const deleteRecipeSuccess = createAction(
  `${PREFIX} Delete one success`,
  props<{ recipe: Recipe }>()
);
export const deleteRecipeError = createAction(
  `${PREFIX} Delete one error`,
  props<{ error: string }>()
);
