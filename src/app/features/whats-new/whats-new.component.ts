import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
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
      return 'Read Post';
    }
    const feature = item as WhatsNewFeature;
    if (feature.action?.label) {
      return feature.action.label;
    }
    if (feature.action?.type === WHATS_NEW_ACTION_TYPES.ROUTE) {
      return 'Go to';
    }
    if (feature.action?.type === WHATS_NEW_ACTION_TYPES.DIALOG) {
      return 'Open';
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
      this._dialogService.open(feature.action.component, {
        header: feature.action.config?.header || feature.title,
        submitButton: feature.action.config?.submitButton,
        cancelButton: feature.action.config?.cancelButton,
      });
    }
  }

  protected close(): void {
    this._drawerRef.close();
  }
}
