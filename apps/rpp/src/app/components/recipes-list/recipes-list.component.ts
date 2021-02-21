import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, mergeMap } from 'rxjs/operators';
import { Recipe } from '../../models/recipe';
import { RppState } from '../../reducers';
import { selectRecipesList } from '../../selectors/recipes';

@Component({
  selector: 'rpp-recipes-list',
  templateUrl: './recipes-list.component.html',
})
export class RecipesListComponent implements OnInit {
  readonly category$ = this.route.queryParams.pipe(
    map(({ category }) => category || null)
  );

  readonly recipes$ = this.category$.pipe(
    mergeMap((category) => {
      return this.store.pipe(select(selectRecipesList, { category }));
    })
  );

  constructor(
    private readonly store: Store<RppState>,
    private readonly route: ActivatedRoute,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Recipes++ > All Recipes');
  }

  trackById(item: Recipe, index: number) {
    return item.id;
  }
}
