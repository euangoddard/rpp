import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { clone, uniqueId } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { delay, map, pluck } from 'rxjs/operators';
import { Recipe, Recipes, UnsavedRecipe } from 'src/app/models/recipe';

@Injectable({
  providedIn: 'any',
})
export class RecipesService {
  constructor(private readonly httpClient: HttpClient) {}

  listRecipes(): Observable<Recipes> {
    return this.httpClient
      .get<{ recipes: Recipes }>('/assets/recipes.json')
      .pipe(pluck('recipes'));
  }

  getRecipe(recipeId: string): Observable<Recipe> {
    return this.listRecipes().pipe(
      map((recipes) => {
        return recipes.find((r) => r.id === recipeId) as Recipe;
      })
    );
  }

  saveRecipe(recipe: Recipe | UnsavedRecipe): Observable<Recipe> {
    let recipeSaved: Recipe;
    if (isUnsavedRecipe(recipe)) {
      recipeSaved = { ...recipe, id: uniqueId() };
    } else {
      recipeSaved = clone(recipe);
    }
    return of(recipeSaved).pipe(delay(300));
  }

  deleteRecipe(recipe: Recipe): Observable<null> {
    return of(null).pipe(delay(150));
  }
}

function isUnsavedRecipe(
  recipe: Recipe | UnsavedRecipe
): recipe is UnsavedRecipe {
  return !recipe.id;
}
