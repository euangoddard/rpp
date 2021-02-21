import { PartialBy } from './generic';

export interface Recipe {
  id: string;
  title: string;
  serves: string;
  ingredients: string;
  method: string;
  categories: readonly string[];
}

export type UnsavedRecipe = PartialBy<Recipe, 'id'>;

export type Recipes = readonly Recipe[];
