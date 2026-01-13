import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ToastService } from '@app/shared/components/toast-container/toast.service';
import { ToastType } from '@app/shared/components/toast/toast.types';
import { TooltipDirective } from '@app/shared/components/tooltip/tooltip.directive';
import { SharePlatform } from './share-post.types';

@Component({
  selector: 'app-share-post',
  standalone: true,
  imports: [ButtonComponent, TooltipDirective],
  templateUrl: './share-post.component.html',
  styleUrl: './share-post.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharePostComponent {
  private readonly _document = inject(DOCUMENT);
  private readonly _toastService = inject(ToastService);

  @Input() postTitle = '';
  @Input() postUrl = '';

  protected readonly sharePlatforms = computed<SharePlatform[]>(() => {
    const url = this.postUrl || this._document.location.href;
    const title = this.postTitle || this._document.title;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return [
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      },
      {
        name: 'LinkedIn',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
      {
        name: 'Telegram',
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      },
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      },
      {
        name: 'Reddit',
        url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      },
      {
        name: 'Email',
        url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      },
      {
        name: 'Instagram',
        url: `https://www.instagram.com/`,
      },
    ];
  });

  protected isInstagram(platform: SharePlatform): boolean {
    return platform.name === 'Instagram';
  }

  protected getTooltipText(platform: SharePlatform): string {
    const tooltips: Record<string, string> = {
      Twitter: 'Поделиться в Twitter/X',
      LinkedIn: 'Поделиться в LinkedIn',
      Facebook: 'Поделиться в Facebook',
      Telegram: 'Поделиться в Telegram',
      WhatsApp: 'Поделиться в WhatsApp',
      Reddit: 'Поделиться в Reddit',
      Email: 'Отправить по email',
      Instagram: 'Ссылка будет скопирована в буфер обмена',
    };
    return tooltips[platform.name] || `Поделиться в ${platform.name}`;
  }

  protected shareOnPlatform(platform: SharePlatform): void {
    if (platform.name === 'Instagram') {
      const url = this.postUrl || this._document.location.href;
      this._copyToClipboard(url, 'Link copied to clipboard! You can paste it in Instagram.');
      return;
    }

    if (platform.name === 'Email') {
      window.location.href = platform.url;
      return;
    }

    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      platform.url,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0`
    );
  }

  private async _copyToClipboard(text: string, successMessage?: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        this._toastService.add({
          type: ToastType.Success,
          header: 'Link copied',
          message: successMessage,
        });
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this._toastService.add({
        type: ToastType.Error,
        header: 'Error',
        message: 'Failed to copy link to clipboard',
      });
    }
  }
}
