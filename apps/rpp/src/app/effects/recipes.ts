import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  deleteRecipe,
  deleteRecipeError,
  deleteRecipeSuccess,
  loadRecipe,
  loadRecipeError,
  loadRecipesList,
  loadRecipesListSuccess,
  loadRecipeSuccess,
  saveRecipe,
  saveRecipeError,
  saveRecipeSuccess,
} from '../actions/recipes';
import { RecipesService } from '../services/recipes.service';

@Injectable()
export class RecipeEffects {
  readonly loadRecipesList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRecipesList.type),
      mergeMap(() => {
        return this.recipesService.listRecipes().pipe(
          map((recipes) => loadRecipesListSuccess({ recipes })),
          catchError((error) => of(loadRecipeError({ error: error.message })))
        );
      })
    )
  );

  readonly loadRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRecipe.type),
      mergeMap((action) => {
        const recipeId = (action as any)['recipeId'];
        return this.recipesService.getRecipe(recipeId).pipe(
          map((recipe) => loadRecipeSuccess({ recipe })),
          catchError((error) => of(loadRecipeError({ error: error.message })))
        );
      })
    )
  );

  readonly saveRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveRecipe.type),
      mergeMap((action) => {
        const unsavedRecipe = (action as any)['recipe'];
        return this.recipesService.saveRecipe(unsavedRecipe).pipe(
          map((recipe) => saveRecipeSuccess({ recipe })),
          catchError((error) => of(saveRecipeError({ error: error.message })))
        );
      })
    )
  );

  readonly deleteRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRecipe.type),
      mergeMap((action) => {
        const recipe = (action as any)['recipe'];
        return this.recipesService.deleteRecipe(recipe).pipe(
          map(() => deleteRecipeSuccess({ recipe })),
          catchError((error) => of(deleteRecipeError({ error: error.message })))
        );
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly recipesService: RecipesService
  ) {}
}
