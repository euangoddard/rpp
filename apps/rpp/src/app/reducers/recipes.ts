import { Action, createReducer, on } from '@ngrx/store';
import { keyBy, omit } from 'lodash-es';
import {
  deleteRecipeSuccess,
  loadRecipesListSuccess,
  loadRecipeSuccess,
  saveRecipeSuccess,
} from '../actions/recipes';
import { Mapping } from '../models/generic';
import { Recipe } from '../models/recipe';

export interface RecipesState {
  recipes: Mapping<Recipe>;
}

const initialState: RecipesState = {
  recipes: {},
};

const recipesReducer = createReducer(
  initialState,
  on(loadRecipesListSuccess, (state, { recipes }) => {
    return { ...state, recipes: keyBy(recipes, 'id') };
  }),
  on(loadRecipeSuccess, (state, { recipe }) => {
    return { ...state, recipes: { ...state.recipes, [recipe.id]: recipe } };
  }),
  on(saveRecipeSuccess, (state, { recipe }) => {
    return { ...state, recipes: { ...state.recipes, [recipe.id]: recipe } };
  }),
  on(deleteRecipeSuccess, (state, { recipe }) => {
    return { ...state, recipes: omit(state.recipes, recipe.id) };
  })
);

export function reducer(state: RecipesState | undefined, action: Action) {
  return recipesReducer(state, action);
}
