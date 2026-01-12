import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { DialogComponent } from '@app/shared/components/dialog/dialog.component';
import { DialogService } from '@app/shared/components/dialog/dialog.service';
import { EMPTY, merge, Subject, timer } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil } from 'rxjs/operators';

@Injectable()
export class ServiceWorkerUpdateService {
  private _updateAvailable = false;
  private _dialogOpen = false;
  private readonly HOUR_MS = 60 * 60 * 1000;
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _swUpdate: SwUpdate,
    private readonly _router: Router,
    private readonly _dialogService: DialogService
  ) {}

  public checkForUpdates(): void {
    if (!this._swUpdate.isEnabled) {
      return;
    }

    this._swUpdate.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this._updateAvailable = true;
        this._promptUpdate();
      });

    timer(0, this.HOUR_MS)
      .pipe(
        switchMap(() => this._swUpdate.checkForUpdate()),
        catchError(() => EMPTY),
        takeUntil(this._destroy$)
      )
      .subscribe();

    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        if (this._updateAvailable) {
          this._promptUpdate();
        } else {
          this._swUpdate
            .checkForUpdate()
            .then((isAvailable) => {
              if (isAvailable) {
                this._updateAvailable = true;
                this._promptUpdate();
              }
            })
            .catch((err) => console.error('[SW Update] Check failed:', err));
        }
      });
  }

  public destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _promptUpdate(): void {
    if (this._dialogOpen) {
      return;
    }

    this._dialogOpen = true;

    const dialog = this._dialogService.open(null, {
      header: 'Update Available',
      text: 'A new version is available. Reload now?',
      submitButton: 'Reload',
      cancelButton: 'Later',
    });

    dialog.submitted.pipe(take(1)).subscribe(() => this._reloadApp(dialog));

    merge(dialog.canceled, dialog.closed)
      .pipe(take(1))
      .subscribe(() => this._closeDialog(dialog));
  }

  private _reloadApp(dialog: DialogComponent): void {
    this._swUpdate
      .activateUpdate()
      .then(() => location.reload())
      .catch((err) => {
        console.error('[SW Update] Activation failed:', err);
        this._closeDialog(dialog);
      });
  }

  private _closeDialog(dialog: DialogComponent): void {
    dialog.close();
    this._dialogOpen = false;
  }
}
