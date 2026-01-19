import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DrawerRef } from '@app/shared/components/drawer/drawer-ref.service';
import { DialogService } from '@app/shared/components/dialog/dialog.service';
import { CardComponent } from '@app/shared/components/card/card.component';
import { PostService } from '@app/entities/post/services/post.service';
import { ContactFormComponent } from '@app/features/contact-form/contact-form.component';
import { Icons } from '@app/shared/components/svg/svg.config';
import { WhatsNewItem, WhatsNewFeature, WhatsNewPost } from './whats-new.types';
import { WHATS_NEW_FEATURES } from './whats-new.data';

@Component({
  selector: 'app-whats-new',
  standalone: true,
  imports: [CommonModule, CardComponent],
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

  protected readonly chevronRightIcon = Icons.ChevronRight as string;

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

  protected isContactFormFeature(item: WhatsNewItem): boolean {
    return !this.isPost(item) && item.title === 'Contact Form';
  }

  protected isClickable(item: WhatsNewItem): boolean {
    return this.isPost(item) || this.isContactFormFeature(item);
  }

  protected onItemClick(item: WhatsNewItem): void {
    if (this.isPost(item)) {
      this._router.navigate(['/blog', item.slug]);
      this._drawerRef.close();
    } else if (this.isContactFormFeature(item)) {
      this._dialogService.open(ContactFormComponent, {
        header: 'Contact Form',
        submitButton: 'Send',
        cancelButton: 'Cancel',
      });
    }
  }

  protected close(): void {
    this._drawerRef.close();
  }
}
