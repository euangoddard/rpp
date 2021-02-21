import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { RppState } from '../../reducers';
import { selectRecipesList } from '../../selectors/recipes';

@Component({
  selector: 'rpp-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly recipesCount$ = this.store.pipe(
    select(selectRecipesList),
    map((recipes) => recipes.length)
  );

  constructor(
    private readonly store: Store<RppState>,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Recipes++ > Home');
  }
}
