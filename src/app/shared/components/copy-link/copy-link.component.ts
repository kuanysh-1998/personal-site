import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';
import { ToastService } from '../toast-container/toast.service';
import { ToastType } from '../toast/toast.types';

@Component({
  selector: 'app-copy-link',
  imports: [SvgComponent],
  templateUrl: './copy-link.component.html',
  styleUrl: './copy-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyLinkComponent {
  private readonly _document = inject(DOCUMENT);
  private readonly _toastService = inject(ToastService);

  protected readonly Icons = Icons;

  protected async copyLink(): Promise<void> {
    const url = this._document.location.href;

    try {
      await navigator.clipboard.writeText(url);
      this._toastService.add({
        type: ToastType.Success,
        header: 'Link copied',
        message: 'Link successfully copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy link to clipboard:', error);
      this._toastService.add({
        type: ToastType.Error,
        header: 'Error',
        message: 'Failed to copy link to clipboard',
      });
    }
  }
}
