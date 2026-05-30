import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { DropdownComponent } from '@app/shared/components/dropdown/dropdown.component';
import { PopoverComponent } from '@app/shared/components/popover/popover.component';
import { DividerComponent } from '@app/shared/components/divider/divider.component';
import { DrawerService } from '@app/shared/components/drawer/drawer.service';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { LocaleService } from '@app/core/services/locale/locale.service';
import { WhatsNewComponent } from '@app/features/whats-new/whats-new.component';
import { DropdownChangeEvent } from '@app/shared/components/dropdown/dropdown.types';
import { TAB_IDS } from '../../pages/layout/main-layout.constants';
import { Icons } from '@app/shared/components/svg/svg.config';
import { NavLink } from './header.types';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
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
  private readonly _drawerService = inject(DrawerService);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);
  private readonly _transloco = inject(TranslocoService);
  protected readonly themeService = inject(ThemeService);
  protected readonly localeService = inject(LocaleService);

  protected readonly navLinks: NavLink[] = [
    { id: TAB_IDS.ABOUT, path: '/about', label: 'About' },
    { id: TAB_IDS.BLOG, path: '/blog', label: 'Blog' },
  ];

  protected readonly mobileMenuOpen = signal(false);
  protected readonly menuIcon = Icons.Menu;

  protected trackNav(link: NavLink): void {
    this._yandexMetrikaService.sendMetricsEvent('tab_switch', {
      tab_id: link.id,
      tab_name: link.label,
    });
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
