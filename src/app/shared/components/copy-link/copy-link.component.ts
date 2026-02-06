import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { ButtonComponent } from '../button/button.component';
import { Icons } from '../svg/svg.config';
import { ToastService } from '../toast-container/toast.service';
import { ToastType } from '../toast/toast.types';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'app-copy-link',
  imports: [TranslocoModule, ButtonComponent, TooltipDirective],
  templateUrl: './copy-link.component.html',
  styleUrl: './copy-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyLinkComponent {
  private readonly _document = inject(DOCUMENT);
  private readonly _toastService = inject(ToastService);
  private readonly _transloco = inject(TranslocoService);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);

  protected readonly Icons = Icons;

  protected async copyLink(): Promise<void> {
    const url = this._document.location.href;

    try {
      await navigator.clipboard.writeText(url);
      this._yandexMetrikaService.sendMetricsEvent('link_copy', {
        url: url,
        page_path: this._document.location.pathname,
      });
      this._toastService.add({
        type: ToastType.Success,
        header: this._transloco.translate('Link copied'),
        message: this._transloco.translate('Link successfully copied to clipboard'),
      });
    } catch (error) {
      console.error('Failed to copy link to clipboard:', error);
      this._toastService.add({
        type: ToastType.Error,
        header: this._transloco.translate('Error'),
        message: this._transloco.translate('Failed to copy link to clipboard'),
      });
    }
  }
}
