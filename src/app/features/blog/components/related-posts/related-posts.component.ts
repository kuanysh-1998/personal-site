import { ChangeDetectionStrategy, Component, Input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { PostService } from '@app/entities/post/services/post.service';
import { CardComponent } from '@app/shared/components/card/card.component';
import { BadgeComponent } from '@app/shared/components/badge/badge.component';
import { Icons } from '@app/shared/components/svg/svg.config';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-related-posts',
  imports: [TranslocoModule, CardComponent, BadgeComponent],
  templateUrl: './related-posts.component.html',
  styleUrl: './related-posts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedPostsComponent {
  private readonly _postService = inject(PostService);
  private readonly _router = inject(Router);

  @Input({ required: true }) public currentSlug = '';

  protected readonly relatedPosts = computed(() => {
    if (!this.currentSlug) {
      return [];
    }
    return this._postService.getRelatedPosts(this.currentSlug, 3);
  });

  protected readonly chevronRightIcon = Icons.ChevronRight;

  protected onPostClick(slug: string): void {
    this._router.navigate(['/blog', slug]);
  }
}
