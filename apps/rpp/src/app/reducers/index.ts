import { RecipesState, reducer as recipesReducer } from './recipes';

export interface RppState {
  recipes: RecipesState;
}

export const RPP_REDUCERS = {
  recipes: recipesReducer,
};
