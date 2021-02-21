import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { mergeMap, tap } from 'rxjs/operators';
import { RppState } from '../../reducers';
import { selectRecipe } from '../../selectors/recipes';

@Component({
  selector: 'rpp-recipe-detail',
  templateUrl: './recipe-detail.component.html',
})
export class RecipeDetailComponent {
  readonly recipe$ = this.route.params.pipe(
    mergeMap(({ recipeId }) => {
      return this.store.pipe(select(selectRecipe, { recipeId }));
    }),
    tap((recipe) => {
      if (recipe) {
        this.title.setTitle(`Recipes++ > Recipes > ${recipe.title}`);
      }
    })
  );

  constructor(
    private readonly store: Store<RppState>,
    private readonly route: ActivatedRoute,
    private readonly title: Title
  ) {}
}
