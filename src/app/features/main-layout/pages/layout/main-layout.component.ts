import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, throttleTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { TAB_IDS } from './main-layout.constants';
import { TabsComponent } from '@app/shared/components/tab/tabs.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { TooltipDirective } from '@app/shared/components/tooltip/tooltip.directive';
import { TableOfContentsComponent } from '@app/features/blog/components/table-of-contents/table-of-contents.component';
import { HeaderComponent } from '../../components/header/header.component';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { DialogService } from '@app/shared/components/dialog/dialog.service';
import { Icons } from '@app/shared/components/svg/svg.config';
import { Tab } from '@app/shared/components/tab/tabs.types';
import { ContactFormComponent } from '@app/features/contact-form/contact-form.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    TabsComponent,
    RouterOutlet,
    ButtonComponent,
    TooltipDirective,
    TableOfContentsComponent,
    HeaderComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements AfterViewInit {
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);
  private readonly _dialogService = inject(DialogService);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly contactIcon = Icons.Contact;

  protected readonly tabs: Tab[] = [
    {
      id: TAB_IDS.ABOUT,
      text: 'About',
    },
    {
      id: TAB_IDS.BLOG,
      text: 'Blog',
    },
  ];

  protected readonly selectedTab = signal<string>(TAB_IDS.ABOUT);
  protected readonly isPostPage = signal<boolean>(false);
  protected readonly showScrollTop = signal(false);

  constructor() {
    this._updateSelectedTabFromUrl();

    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._updateSelectedTabFromUrl();
        this._cdr.markForCheck();
      });
  }

  public ngAfterViewInit(): void {
    fromEvent(document, 'scroll', { capture: true })
      .pipe(throttleTime(100), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        this.showScrollTop.set(scrollPosition > 300);
      });
  }

  protected onTabChanged(tab: Tab): void {
    this._yandexMetrikaService.sendMetricsEvent('tab_switch', {
      tab_id: tab.id,
      tab_name: tab.text || tab.id,
    });
    this._router.navigate([`/${tab.id}`]);
  }

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  private _updateSelectedTabFromUrl(): void {
    const url = this._router.url;
    const isPost = /^\/blog\/[^\/]+$/.test(url);

    this.isPostPage.set(isPost);

    if (url.includes('/blog')) {
      this.selectedTab.set(TAB_IDS.BLOG);
    } else if (url.includes('/about') || url === '/' || url === '') {
      this.selectedTab.set(TAB_IDS.ABOUT);
    }
  }

  protected openContactForm(): void {
    this._dialogService.open(ContactFormComponent, {
      header: 'Contact Form',
      submitButton: 'Send',
      cancelButton: 'Cancel',
    });
  }
}
