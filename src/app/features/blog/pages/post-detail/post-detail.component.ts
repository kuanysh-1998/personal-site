import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { PostService } from '@app/entities/post/services/post.service';
import { PostState } from '@app/entities/post/models/post.interface';
import { Observable, of, switchMap } from 'rxjs';
import { filter, map, shareReplay, startWith, take, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlogContentReadyService } from '../../services/blog-content-ready.service';
import { SkeletonComponent } from '@app/shared/components/skeleton/skeleton.component';
import { PostNavigationComponent } from '../../components/post-navigation/post-navigation.component';
import { CopyLinkComponent } from '@app/shared/components/copy-link/copy-link.component';
import { SharePostComponent } from '../../components/share-post/share-post.component';
import { DOCUMENT } from '@angular/common';
import { ReadingTimePipe } from '@app/shared/pipes/reading-time.pipe';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { LinkComponent } from '@app/shared/components/link/link.component';
import { ReadingProgressBarComponent } from '../../components/reading-progress-bar/reading-progress-bar.component';
import { ViewCounterService } from '../../services/view-counter.service';
import { SvgComponent } from '@app/shared/components/svg/svg.component';
import { Icons } from '@app/shared/components/svg/svg.config';
import { TranslocoModule } from '@ngneat/transloco';
import { CopyCodeDirective } from '@app/shared/directives/copy-code.directive';
import { BadgeComponent } from '@app/shared/components/badge/badge.component';

@Component({
  selector: 'app-post-detail',
  imports: [
    AsyncPipe,
    TranslocoModule,
    MarkdownComponent,
    SkeletonComponent,
    PostNavigationComponent,
    CopyLinkComponent,
    SharePostComponent,
    ReadingTimePipe,
    LinkComponent,
    ReadingProgressBarComponent,
    SvgComponent,
    CopyCodeDirective,
    BadgeComponent,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _postService = inject(PostService);
  private readonly _document = inject(DOCUMENT);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);
  private readonly _viewCounterService = inject(ViewCounterService);
  private readonly _contentReadyService = inject(BlogContentReadyService);

  protected readonly eyeIcon = Icons.Eye;

  protected readonly postState$: Observable<PostState> = this._route.paramMap.pipe(
    map((params) => params.get('slug') || ''),
    switchMap((slug) =>
      this._postService.getPostBySlug(slug).pipe(
        tap((result) => {
          if (result.post && !result.unavailableInLanguage) {
            this._yandexMetrikaService.sendMetricsEvent('post_view', {
              post_slug: result.post.slug,
              post_title: result.post.title,
            });
            this._viewCounterService.incrementView(result.post.slug).pipe(take(1)).subscribe();
          }
        }),
        map((result) => ({
          loading: false,
          post: result.post,
          previousPost: result.post ? this._postService.getPreviousPost(slug) : null,
          nextPost: result.post ? this._postService.getNextPost(slug) : null,
          unavailableInLanguage: result.unavailableInLanguage,
        })),
        startWith({
          loading: true,
          post: null,
          previousPost: null,
          nextPost: null,
        }),
        shareReplay(1),
      ),
    ),
  );

  protected readonly viewCount$: Observable<number> = this._route.paramMap.pipe(
    map((params) => params.get('slug') || ''),
    switchMap((slug) => (slug ? this._viewCounterService.getViewCount(slug) : of(0))),
  );

  constructor() {
    this.postState$
      .pipe(
        filter((state) => state.post !== null),
        takeUntilDestroyed(),
      )
      .subscribe(() => this._contentReadyService.notify());
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  protected getCurrentUrl(): string {
    return this._document.location.href;
  }
}
