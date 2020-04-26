import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval, NEVER, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

/**
 * SwUpdatesService
 *
 * @description
 * 1. Checks for available ServiceWorker updates once instantiated.
 * 2. Re-checks every 6 hours.
 * 3. Whenever an update is available, it activates the update.
 *
 * @property
 * `updateActivated` {Observable<string>} - Emit the version hash whenever an update is activated.
 */
@Injectable({
  providedIn: 'root',
})
export class SwUpdatesService implements OnDestroy {
  private readonly checkInterval = 1000 * 60 * 60 * 6; // 6 hours
  private readonly onDestroy = new Subject<void>();
  readonly updateActivated: Observable<string>;

  constructor(appRef: ApplicationRef, private readonly swu: SwUpdate) {
    if (!swu.isEnabled) {
      this.updateActivated = NEVER.pipe(takeUntil(this.onDestroy));
      return;
    }

    // Periodically check for updates (after the app is stabilized).
    const appIsStable = appRef.isStable.pipe(first((v) => v));
    concat(appIsStable, interval(this.checkInterval))
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => this.swu.checkForUpdate());

    // Activate available updates.
    this.swu.available
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => this.swu.activateUpdate());

    // Notify about activated updates.
    this.updateActivated = this.swu.activated.pipe(
      map((evt) => evt.current.hash),
      takeUntil(this.onDestroy)
    );
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
