import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { GetPostResult, Post, PostMetadata } from '../models/post.interface';
import { POSTS } from '@app/features/blog/data/posts.data';
import { LocaleService } from '@app/core/services/locale/locale.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly _http = inject(HttpClient);
  private readonly _localeService = inject(LocaleService);
  private readonly _transloco = inject(TranslocoService);

  private static _isHtmlResponse(text: string): boolean {
    const trimmed = text.trim().toLowerCase();
    return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
  }

  public getAllPosts(): PostMetadata[] {
    return [...POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getPostBySlug(slug: string): Observable<GetPostResult> {
    const metadata = POSTS.find((p) => p.slug === slug);

    if (!metadata) {
      return of({ post: null });
    }

    const lang = this._localeService.getActiveLang();
    const path = `/assets/posts/${lang}/${slug}.md`;

    return this._http.get(path, { responseType: 'text' }).pipe(
      map((content) => {
        if (PostService._isHtmlResponse(content)) {
          if (lang === 'en') {
            return { post: null };
          }
          return {
            post: { ...metadata, content: '' },
            unavailableInLanguage: true,
          };
        }
        return { post: { ...metadata, content }, unavailableInLanguage: false };
      }),
      catchError(() => {
        if (lang === 'en') {
          return of({ post: null });
        }
        return of({
          post: { ...metadata, content: '' },
          unavailableInLanguage: true,
        });
      }),
    );
  }

  public getPostsGroupedByYear(): Map<number, PostMetadata[]> {
    const grouped = new Map<number, PostMetadata[]>();

    this.getAllPosts().forEach((post) => {
      const year = new Date(post.date).getFullYear();
      const yearPosts = grouped.get(year) || [];
      grouped.set(year, [...yearPosts, post]);
    });

    return grouped;
  }

  public getPreviousPost(currentSlug: string): PostMetadata | null {
    const allPosts = this.getAllPosts();
    const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

    if (currentIndex === -1 || currentIndex === allPosts.length - 1) {
      return null;
    }

    return allPosts[currentIndex + 1];
  }

  public getNextPost(currentSlug: string): PostMetadata | null {
    const allPosts = this.getAllPosts();
    const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

    if (currentIndex === -1 || currentIndex === 0) {
      return null;
    }

    return allPosts[currentIndex - 1];
  }

  public searchPosts(query: string): PostMetadata[] {
    if (!query || query.trim().length === 0) {
      return this.getAllPosts();
    }

    const normalizedQuery = this._normalizeSearchString(query.trim());
    const allPosts = this.getAllPosts();

    return allPosts.filter((post) => {
      const translatedTitle = this._transloco.translate(post.title);
      const translatedDescription = post.description
        ? this._transloco.translate(post.description)
        : '';
      const titleMatch = this._normalizeSearchString(translatedTitle).includes(normalizedQuery);
      const descriptionMatch =
        translatedDescription.length > 0 &&
        this._normalizeSearchString(translatedDescription).includes(normalizedQuery);
      const slugMatch = this._normalizeSearchString(post.slug).includes(normalizedQuery);

      return titleMatch || descriptionMatch || slugMatch;
    });
  }

  public getRelatedPosts(currentSlug: string, limit = 3): PostMetadata[] {
    const currentPost = POSTS.find((p) => p.slug === currentSlug);

    if (!currentPost || !currentPost.tags || currentPost.tags.length === 0) {
      return [];
    }

    const allPosts = this.getAllPosts().filter((post) => post.slug !== currentSlug);

    const postsWithScore = allPosts
      .map((post) => {
        if (!post.tags || post.tags.length === 0) {
          return { post, score: 0 };
        }

        const commonTags = post.tags.filter((tag) => currentPost.tags?.includes(tag));
        return { post, score: commonTags.length };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return postsWithScore.slice(0, limit).map((item) => item.post);
  }

  private _normalizeSearchString(value: string): string {
    return value.toLowerCase().trim();
  }
}
