import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';

@Component({
  selector: 'app-copy-link',
  imports: [SvgComponent],
  templateUrl: './copy-link.component.html',
  styleUrl: './copy-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyLinkComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly isCopied = signal<boolean>(false);
  protected readonly Icons = Icons;

  protected async copyLink(): Promise<void> {
    const url = this._document.location.href;

    try {
      await navigator.clipboard.writeText(url);
      this.isCopied.set(true);
      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }
}
