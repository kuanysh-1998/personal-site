import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServiceWorkerUpdateService } from './core/services/service-worker-update/service-worker-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  constructor(private readonly _serviceWorkerUpdateService: ServiceWorkerUpdateService) {}

  public ngOnInit(): void {
    this._serviceWorkerUpdateService.checkForUpdates();
  }
}
