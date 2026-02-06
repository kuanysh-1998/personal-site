import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { DrawerRef } from '@app/shared/components/drawer/drawer-ref.service';
import { DialogService } from '@app/shared/components/dialog/dialog.service';
import { AccordionComponent } from '@app/shared/components/accordion/accordion.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { PostService } from '@app/entities/post/services/post.service';
import {
  WhatsNewItem,
  WhatsNewFeature,
  WhatsNewPost,
  WHATS_NEW_ACTION_TYPES,
} from './whats-new.types';
import { WHATS_NEW_FEATURES } from './whats-new.data';

@Component({
  selector: 'app-whats-new',
  standalone: true,
  imports: [CommonModule, AccordionComponent, ButtonComponent],
  templateUrl: './whats-new.component.html',
  styleUrl: './whats-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsNewComponent {
  private readonly _drawerRef = inject(DrawerRef);
  private readonly _postService = inject(PostService);
  private readonly _router = inject(Router);
  private readonly _dialogService = inject(DialogService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly features = WHATS_NEW_FEATURES;

  protected readonly posts = computed<WhatsNewPost[]>(() => {
    return this._postService.getAllPosts().map((post) => ({
      ...post,
      date: new Date(post.date),
    }));
  });

  protected readonly allItems = computed<WhatsNewItem[]>(() => {
    const featuresArray: WhatsNewFeature[] = this.features.map((f) => ({ ...f }));
    const postsArray = this.posts();
    return [...featuresArray, ...postsArray].sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  protected getItemHeader(item: WhatsNewItem): string {
    if (this.isPost(item)) {
      return this._transloco.translate((item as WhatsNewPost).title);
    }
    return this._transloco.translate((item as WhatsNewFeature).title);
  }

  protected getItemDescription(item: WhatsNewItem): string {
    if (this.isPost(item)) {
      const description = (item as WhatsNewPost).description ?? '';
      return description ? this._transloco.translate(description) : '';
    }
    const description = (item as WhatsNewFeature).description;
    return description ? this._transloco.translate(description) : '';
  }

  protected formatDate(date: Date): string {
    const lang = this._transloco.getActiveLang();
    const locale = lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  protected isPost(item: WhatsNewItem): item is WhatsNewItem & { slug: string } {
    return 'slug' in item && !!item.slug;
  }

  protected hasAction(item: WhatsNewItem): boolean {
    if (this.isPost(item)) {
      return true;
    }
    return !!(item as WhatsNewFeature).action;
  }

  protected getActionLabel(item: WhatsNewItem): string {
    if (this.isPost(item)) {
      return this._transloco.translate('Read Post');
    }
    const feature = item as WhatsNewFeature;
    if (feature.action?.label) {
      return this._transloco.translate(feature.action.label);
    }
    if (feature.action?.type === WHATS_NEW_ACTION_TYPES.ROUTE) {
      return this._transloco.translate('Go to');
    }
    if (feature.action?.type === WHATS_NEW_ACTION_TYPES.DIALOG) {
      return this._transloco.translate('Open');
    }
    return '';
  }

  protected handleAction(item: WhatsNewItem): void {
    if (this.isPost(item)) {
      this._router.navigate(['/blog', item.slug]);
      this._drawerRef.close();
      return;
    }

    const feature = item as WhatsNewFeature;
    if (!feature.action) {
      return;
    }

    if (feature.action.type === WHATS_NEW_ACTION_TYPES.ROUTE) {
      this._router.navigate([feature.action.route]);
      this._drawerRef.close();
    } else if (feature.action.type === WHATS_NEW_ACTION_TYPES.DIALOG) {
      const config = feature.action.config;
      this._dialogService.open(feature.action.component, {
        header: config?.header
          ? this._transloco.translate(config.header)
          : this._transloco.translate(feature.title),
        submitButton: config?.submitButton
          ? this._transloco.translate(config.submitButton)
          : undefined,
        cancelButton: config?.cancelButton
          ? this._transloco.translate(config.cancelButton)
          : undefined,
      });
    }
  }

  protected close(): void {
    this._drawerRef.close();
  }
}
