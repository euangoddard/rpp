import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Index } from 'lunr';
import { Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { SearchWorkerInstruction } from 'src/app/components/search/search.models';
import { Recipe } from 'src/app/models/recipe';
import { RppState } from 'src/app/reducers';
import {
  selectRecipesById,
  selectRecipesList,
} from 'src/app/selectors/recipes';

@Component({
  selector: 'rpp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  host: {
    '[class.active]': 'isActive',
  },
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchBox') private readonly searchBoxElement: ElementRef<
    HTMLInputElement
  >;

  isActive = false;

  private readonly searchWorker: Worker;
  private readonly isDestroyed = new Subject<void>();
  private readonly querySubject = new Subject<string>();
  private readonly resultsSubject = new Subject<readonly Index.Result[]>();

  readonly query$ = this.querySubject.pipe(
    map((q) => q?.trim()),
    distinctUntilChanged()
  );

  readonly results$ = this.resultsSubject.pipe(
    withLatestFrom(this.store.pipe(select(selectRecipesById))),
    map(([results, recipesBuId]) => {
      return results.map(({ ref }) => recipesBuId[ref]);
    })
  );

  constructor(private readonly store: Store<RppState>) {
    this.searchWorker = new Worker('./search.worker', { type: 'module' });
  }

  ngOnInit(): void {
    this.store
      .pipe(
        select(selectRecipesList),
        filter((r) => !!r?.length),
        takeUntil(this.isDestroyed)
      )
      .subscribe((recipes) => {
        this.searchWorker.postMessage({
          instruction: SearchWorkerInstruction.Index,
          recipes,
        });
      });

    this.query$.pipe(takeUntil(this.isDestroyed)).subscribe((query) => {
      this.searchWorker.postMessage({
        instruction: SearchWorkerInstruction.Query,
        query,
      });
    });

    this.searchWorker.onmessage = ({ data }) => {
      this.resultsSubject.next(data['results']);
    };
  }

  ngOnDestroy(): void {
    this.isDestroyed.next();
    this.isDestroyed.complete();
  }

  receiveInput(event: InputEvent): void {
    this.querySubject.next((event.target as HTMLInputElement).value);
  }

  handleKeyUp(keyCode: any): void {
    if (keyCode === 'Escape') {
      this.clearQuery();
    }
  }

  clearQuery(): void {
    this.querySubject.next('');
    this.searchBoxElement.nativeElement.value = '';
  }

  trackById(item: Recipe, index: number) {
    return item.id;
  }
}
