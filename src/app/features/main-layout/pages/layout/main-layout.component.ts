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
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { TooltipDirective } from '@app/shared/components/tooltip/tooltip.directive';
import { TableOfContentsComponent } from '@app/features/blog/components/table-of-contents/table-of-contents.component';
import { HeaderComponent } from '../../components/header/header.component';
import { DialogService } from '@app/shared/components/dialog/dialog.service';
import { Icons } from '@app/shared/components/svg/svg.config';
import { ContactFormComponent } from '@app/features/contact-form/contact-form.component';

@Component({
  selector: 'app-main-layout',
  imports: [
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
  private readonly _dialogService = inject(DialogService);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly contactIcon = Icons.Contact;

  protected readonly isPostPage = signal<boolean>(false);
  protected readonly showScrollTop = signal(false);

  constructor() {
    this._updatePostPage();

    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._updatePostPage();
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

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  private _updatePostPage(): void {
    const url = this._router.url;
    const isPost = /^\/blog\/[^\/]+$/.test(url);
    this.isPostPage.set(isPost);
  }

  protected openContactForm(): void {
    this._dialogService.open(ContactFormComponent, {
      header: 'Contact Form',
      submitButton: 'Send',
      cancelButton: 'Cancel',
    });
  }
}
