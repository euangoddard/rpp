import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadRecipesList } from './actions/recipes';
import { RppState } from './reducers';
import { SwUpdatesService } from './services/sw-updates.service';

@Component({
  selector: 'rpp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(
    private readonly store: Store<RppState>,
    private readonly swUpdates: SwUpdatesService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadRecipesList());
    this.swUpdates.updateActivated.subscribe(() => {
      console.log('Update activated!');
    });
  }
}
