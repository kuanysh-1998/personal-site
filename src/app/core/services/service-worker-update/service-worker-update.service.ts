import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { EMPTY, timer } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';

@Injectable()
export class ServiceWorkerUpdateService {
  private readonly _swUpdate = inject(SwUpdate);
  private readonly _router = inject(Router);
  private _updateAvailable = false;
  private readonly HOUR_MS = 60 * 60 * 1000;

  public checkForUpdates(): void {
    if (!this._swUpdate.isEnabled) {
      return;
    }

    this._swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this._updateAvailable = true;
        this._promptUpdate();
      });

    timer(0, this.HOUR_MS)
      .pipe(
        switchMap(() => this._swUpdate.checkForUpdate()),
        catchError(() => EMPTY)
      )
      .subscribe();

    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this._updateAvailable) {
        this._promptUpdate();
      } else {
        this._swUpdate
          .checkForUpdate()
          .then((isAvailable: boolean) => {
            if (isAvailable) {
              this._updateAvailable = true;
              this._promptUpdate();
            }
          })
          .catch((err: unknown) => console.error('[Service Worker Update] error:', err));
      }
    });
  }

  private _promptUpdate(): void {
    if (this._updateAvailable && window.confirm('Доступна новая версия. Перезагрузить страницу?')) {
      this._swUpdate
        .activateUpdate()
        .then(() => {
          location.reload();
        })
        .catch((err: unknown) => {
          console.error('[SW] activateUpdate error:', err);
        });
    }
  }
}
