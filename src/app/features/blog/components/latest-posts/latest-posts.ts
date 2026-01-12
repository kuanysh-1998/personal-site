import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '@app/entities/post/services/post.service';

@Component({
  selector: 'app-latest-posts',
  imports: [RouterLink],
  templateUrl: './latest-posts.html',
  styleUrl: './latest-posts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatestPosts {
  private readonly _postService = inject(PostService);

  protected readonly latestPosts = computed(() => {
    return this._postService.getAllPosts().slice(0, 3);
  });
}
