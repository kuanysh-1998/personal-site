import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { TabsComponent } from '@app/shared/components/tab/tabs.component';
import { DropdownComponent } from '@app/shared/components/dropdown/dropdown.component';
import { PopoverComponent } from '@app/shared/components/popover/popover.component';
import { DividerComponent } from '@app/shared/components/divider/divider.component';
import { DrawerService } from '@app/shared/components/drawer/drawer.service';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { LocaleService } from '@app/core/services/locale/locale.service';
import { WhatsNewComponent } from '@app/features/whats-new/whats-new.component';
import { Tab } from '@app/shared/components/tab/tabs.types';
import { DropdownChangeEvent } from '@app/shared/components/dropdown/dropdown.types';
import { TAB_IDS } from '../../pages/layout/main-layout.constants';
import { Icons } from '@app/shared/components/svg/svg.config';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    ButtonComponent,
    TabsComponent,
    DropdownComponent,
    PopoverComponent,
    DividerComponent,
    TranslocoModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly _router = inject(Router);
  private readonly _drawerService = inject(DrawerService);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);
  private readonly _transloco = inject(TranslocoService);
  protected readonly themeService = inject(ThemeService);
  protected readonly localeService = inject(LocaleService);

  protected readonly currentUrl = signal<string>(this._router.url);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly menuIcon = Icons.Menu;

  protected readonly tabs = computed<Tab[]>(() => {
    this.localeService.currentLang();
    return [
      { id: TAB_IDS.ABOUT, text: this._transloco.translate('About') },
      { id: TAB_IDS.BLOG, text: this._transloco.translate('Blog') },
    ];
  });

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
    return TAB_IDS.ABOUT;
  }

  protected onTabChanged(tab: Tab): void {
    this._yandexMetrikaService.sendMetricsEvent('tab_switch', {
      tab_id: tab.id,
      tab_name: tab.text || tab.id,
    });
    this._router.navigate([`/${tab.id}`]);
    this.mobileMenuOpen.set(false);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected get themeToggleIcon(): string {
    return this.themeService.theme() === 'dark' ? 'sun' : 'moon';
  }

  protected get themeToggleAriaLabel(): string {
    const key =
      this.themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    return this._transloco.translate(key);
  }

  protected onLanguageChanged(value: DropdownChangeEvent): void {
    const lang = Array.isArray(value) ? value[0] : value;
    if (lang != null) {
      this.localeService.setLang(String(lang));
    }
  }

  protected openWhatsNew(): void {
    const header = this._transloco.translate("What's new");
    const closeLabel = this._transloco.translate('Close');
    const drawerRef = this._drawerService.open(WhatsNewComponent, {
      header,
      customWidth: '500px',
      additionalButton: closeLabel,
    });

    drawerRef.additionalAction.pipe(take(1)).subscribe(() => {
      drawerRef.close();
    });
  }
}
