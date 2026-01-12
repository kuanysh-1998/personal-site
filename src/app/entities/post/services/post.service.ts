import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Post, PostMetadata } from '../models/post.interface';
import { POSTS } from '@app/features/blog/data/posts.data';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly _http = inject(HttpClient);

  public getAllPosts(): PostMetadata[] {
    return [...POSTS].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getPostBySlug(slug: string): Observable<Post | null> {
    const metadata = POSTS.find((p) => p.slug === slug);

    if (!metadata) {
      return of(null);
    }

    return this._http.get(`/assets/posts/${slug}.md`, { responseType: 'text' }).pipe(
      map((content) => ({ ...metadata, content })),
      catchError(() => of(null))
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
}
