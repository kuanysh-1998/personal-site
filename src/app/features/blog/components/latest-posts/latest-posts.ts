import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '@app/entities/post/services/post.service';
import { CardComponent } from '@app/shared/components/card/card.component';
import { BadgeComponent } from '@app/shared/components/badge/badge.component';
import { LinkComponent } from '@app/shared/components/link/link.component';
import { Icons } from '@app/shared/components/svg/svg.config';

@Component({
  selector: 'app-latest-posts',
  imports: [CardComponent, BadgeComponent, LinkComponent],
  templateUrl: './latest-posts.html',
  styleUrl: './latest-posts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatestPosts {
  private readonly _postService = inject(PostService);
  private readonly _router = inject(Router);

  protected readonly latestPosts = computed(() => {
    return this._postService.getAllPosts().slice(0, 3);
  });

  protected readonly chevronRightIcon = Icons.ChevronRight;

  protected onPostClick(slug: string): void {
    this._router.navigate(['/blog', slug]);
  }
}
