import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadRecipesList } from 'src/app/actions/recipes';
import { RppState } from 'src/app/reducers';
import { SwUpdatesService } from 'src/app/services/sw-updates.service';

@Component({
  selector: 'rpp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(
    private readonly store: Store<RppState>,
    private readonly swUpdates: SwUpdatesService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadRecipesList());
    this.swUpdates.updateActivated.subscribe(() => {
      console.log('Update activated!');
    })
  }
}
