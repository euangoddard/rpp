import {
  RecipesState,
  reducer as recipesReducer,
} from 'src/app/reducers/recipes';

export interface RppState {
  recipes: RecipesState;
}

export const RPP_REDUCERS = {
  recipes: recipesReducer,
};
