export interface RecipePointer {
  title: string;
  url: string;
}

export type RecipePointers = readonly RecipePointer[];

export interface RecipeListItem extends RecipePointer {
  tags: readonly string[];
}
