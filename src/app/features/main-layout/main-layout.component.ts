import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabsComponent } from '../../shared/components/tab/tabs.component';
import { Tab } from '../../shared/components/tab/tabs.types';
import { YandexMetrikaService } from '../../core/services/yandex-metrika/yandex-metrika.service';

@Component({
  selector: 'app-main-layout',
  imports: [TabsComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);

  protected readonly tabs: Tab[] = [
    {
      id: 'about',
      text: 'About',
    },
    {
      id: 'blog',
      text: 'Blog',
    },
  ];

  protected readonly selectedTab = signal<string>('about');

  constructor() {
    this._updateSelectedTabFromUrl();

    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this._updateSelectedTabFromUrl();
        this._cdr.markForCheck();
      });
  }

  protected onTabChanged(tab: Tab): void {
    this._yandexMetrikaService.sendMetricsEvent('tab_switch', {
      tab_id: tab.id,
      tab_name: tab.text || tab.id,
    });
    this._router.navigate([`/${tab.id}`]);
  }

  private _updateSelectedTabFromUrl(): void {
    const url = this._router.url;
    if (url.includes('/blog')) {
      this.selectedTab.set('blog');
    } else if (url.includes('/about') || url === '/' || url === '') {
      this.selectedTab.set('about');
    }
  }
}
