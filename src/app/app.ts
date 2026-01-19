import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServiceWorkerUpdateService } from './core/services/service-worker-update/service-worker-update.service';
import { DialogService } from './shared/components/dialog/dialog.service';
import { DrawerService } from './shared/components/drawer/drawer.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { YandexMetrikaService } from './core/services/yandex-metrika/yandex-metrika.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);
  private readonly _serviceWorkerUpdateService = inject(ServiceWorkerUpdateService);
  private readonly _dialogService = inject(DialogService);
  private readonly _drawerService = inject(DrawerService);
  private readonly _viewContainerRef = inject(ViewContainerRef);

  public ngOnInit(): void {
    this._serviceWorkerUpdateService.checkForUpdates();
    this._dialogService.setViewContainerRef(this._viewContainerRef);
    this._drawerService.setViewContainerRef(this._viewContainerRef);
    this._yandexMetrikaService.initMetrika();
  }
}
