import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { PostService } from '@app/entities/post/services/post.service';
import { PostState } from '@app/entities/post/models/post.interface';
import { fromEvent, Observable, of, switchMap } from 'rxjs';
import { map, startWith, throttleTime } from 'rxjs/operators';
import { SkeletonComponent } from '@app/shared/components/skeleton/skeleton.component';
import { PostNavigationComponent } from '../../components/post-navigation/post-navigation.component';
import { CopyLinkComponent } from '@app/shared/components/copy-link/copy-link.component';
import { SharePostComponent } from '../../components/share-post/share-post.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { ReadingTimePipe } from '@app/shared/pipes/reading-time.pipe';
import { YandexMetrikaService } from '@app/core/services/yandex-metrika/yandex-metrika.service';
import { LinkComponent } from '@app/shared/components/link/link.component';
import { TooltipDirective } from '@app/shared/components/tooltip/tooltip.directive';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ReadingProgressBarComponent } from '../../components/reading-progress-bar/reading-progress-bar.component';
import { ViewCounterService } from '../../services/view-counter.service';

@Component({
  selector: 'app-post-detail',
  imports: [
    AsyncPipe,
    MarkdownComponent,
    SkeletonComponent,
    PostNavigationComponent,
    CopyLinkComponent,
    SharePostComponent,
    ReadingTimePipe,
    LinkComponent,
    TooltipDirective,
    ButtonComponent,
    ReadingProgressBarComponent,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent implements AfterViewInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _postService = inject(PostService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _yandexMetrikaService = inject(YandexMetrikaService);
  private readonly _viewCounterService = inject(ViewCounterService);

  protected readonly showScrollTop = signal(false);

  protected readonly postState$: Observable<PostState> = this._route.paramMap.pipe(
    map((params) => params.get('slug') || ''),
    switchMap((slug) =>
      this._postService.getPostBySlug(slug).pipe(
        map((post) => {
          if (post) {
            this._yandexMetrikaService.sendMetricsEvent('post_view', {
              post_slug: post.slug,
              post_title: post.title,
            });
            this._viewCounterService
              .incrementView(post.slug)
              .pipe(takeUntilDestroyed(this._destroyRef))
              .subscribe();
          }
          return {
            loading: false,
            post,
            previousPost: post ? this._postService.getPreviousPost(slug) : null,
            nextPost: post ? this._postService.getNextPost(slug) : null,
          };
        }),
        startWith({
          loading: true,
          post: null,
          previousPost: null,
          nextPost: null,
        })
      )
    )
  );

  protected readonly viewCount$: Observable<number> = this._route.paramMap.pipe(
    map((params) => params.get('slug') || ''),
    switchMap((slug) => (slug ? this._viewCounterService.getViewCount(slug) : of(0)))
  );

  public ngAfterViewInit(): void {
    fromEvent(document, 'scroll', { capture: true })
      .pipe(throttleTime(100), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        this.showScrollTop.set(scrollPosition > 300);
      });
  }

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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
