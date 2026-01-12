import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { PostService } from '@app/entities/post/services/post.service';
import { Post, PostMetadata } from '@app/entities/post/models/post.interface';
import { Observable, switchMap } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SkeletonComponent } from '@app/shared/components/skeleton/skeleton.component';
import { PostNavigationComponent } from '../../components/post-navigation/post-navigation.component';
import { CopyLinkComponent } from '@app/shared/components/copy-link/copy-link.component';

type PostState = {
  loading: boolean;
  post: Post | null;
  previousPost: PostMetadata | null;
  nextPost: PostMetadata | null;
};

@Component({
  selector: 'app-post-detail',
  imports: [
    AsyncPipe,
    RouterLink,
    MarkdownComponent,
    SkeletonComponent,
    PostNavigationComponent,
    CopyLinkComponent,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _postService = inject(PostService);

  protected readonly postState$: Observable<PostState> = this._route.paramMap.pipe(
    map((params) => params.get('slug') || ''),
    switchMap((slug) =>
      this._postService.getPostBySlug(slug).pipe(
        map((post) => ({
          loading: false,
          post,
          previousPost: post ? this._postService.getPreviousPost(slug) : null,
          nextPost: post ? this._postService.getNextPost(slug) : null,
        })),
        startWith({
          loading: true,
          post: null,
          previousPost: null,
          nextPost: null,
        })
      )
    )
  );

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
