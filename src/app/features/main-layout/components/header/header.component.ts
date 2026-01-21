import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { TabsComponent } from '@app/shared/components/tab/tabs.component';
import { DrawerService } from '@app/shared/components/drawer/drawer.service';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { WhatsNewComponent } from '@app/features/whats-new/whats-new.component';
import { Tab } from '@app/shared/components/tab/tabs.types';
import { TAB_IDS } from '../../pages/layout/main-layout.constants';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonComponent, TabsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly _router = inject(Router);
  private readonly _drawerService = inject(DrawerService);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);

  protected readonly currentUrl = signal<string>(this._router.url);

  protected readonly tabs: Tab[] = [
    {
      id: TAB_IDS.ABOUT,
      text: 'About',
    },
    {
      id: TAB_IDS.BLOG,
      text: 'Blog',
    },
    {
      id: TAB_IDS.INTERVIEW,
      text: 'Interview',
    },
  ];

  constructor() {
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.url);
      });
  }

  protected get selectedTab(): string {
    const url = this.currentUrl();
    if (url.includes('/blog')) {
      return TAB_IDS.BLOG;
    }
    if (url.includes('/interview')) {
      return TAB_IDS.INTERVIEW;
    }
    return TAB_IDS.ABOUT;
  }

  protected onTabChanged(tab: Tab): void {
    this._yandexMetrikaService.sendMetricsEvent('tab_switch', {
      tab_id: tab.id,
      tab_name: tab.text || tab.id,
    });
    this._router.navigate([`/${tab.id}`]);
  }

  protected openWhatsNew(): void {
    const drawerRef = this._drawerService.open(WhatsNewComponent, {
      header: "What's New",
      customWidth: '500px',
      additionalButton: 'Close',
    });

    drawerRef.additionalAction.pipe(take(1)).subscribe(() => {
      drawerRef.close();
    });
  }
}
