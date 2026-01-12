import { ChangeDetectionStrategy, Component, OnInit, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServiceWorkerUpdateService } from './core/services/service-worker-update/service-worker-update.service';
import { DialogService } from './shared/components/dialog/dialog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  constructor(
    private readonly _serviceWorkerUpdateService: ServiceWorkerUpdateService,
    private readonly _dialogService: DialogService,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  public ngOnInit(): void {
    this._serviceWorkerUpdateService.checkForUpdates();
    this._dialogService.setViewContainerRef(this._viewContainerRef);
  }
}
