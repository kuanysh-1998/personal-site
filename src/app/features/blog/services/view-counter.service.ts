import { inject, Injectable } from '@angular/core';
import { Database, objectVal, ref, runTransaction } from '@angular/fire/database';
import { Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ViewCounterService {
  private readonly _db = inject(Database);
  private readonly _viewedPostsKey = 'viewed_posts';

  private _hasViewedPost(postId: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    try {
      const viewedPosts = JSON.parse(
        window.localStorage.getItem(this._viewedPostsKey) || '[]'
      ) as string[];
      return viewedPosts.includes(postId);
    } catch {
      return false;
    }
  }

  private _markPostAsViewed(postId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const viewedPosts = JSON.parse(
        window.localStorage.getItem(this._viewedPostsKey) || '[]'
      ) as string[];
      if (!viewedPosts.includes(postId)) {
        viewedPosts.push(postId);
        window.localStorage.setItem(this._viewedPostsKey, JSON.stringify(viewedPosts));
      }
    } catch {}
  }

  public incrementView(postId: string): Observable<number> {
    if (!postId) {
      return of(0);
    }

    if (this._hasViewedPost(postId)) {
      return of(0);
    }

    const viewRef = ref(this._db, `post-views/${postId}`);
    return from(
      runTransaction(viewRef, (currentViews: number | null) => {
        return (currentViews || 0) + 1;
      })
    ).pipe(
      map((result) => {
        if (result.committed && result.snapshot.val() !== null) {
          return result.snapshot.val() as number;
        }
        throw new Error('Transaction failed');
      }),
      tap(() => {
        this._markPostAsViewed(postId);
      }),
      catchError(() => {
        return of(0);
      })
    );
  }

  public getViewCount(postId: string): Observable<number> {
    if (!postId) {
      return of(0);
    }

    const viewRef = ref(this._db, `post-views/${postId}`);
    return objectVal<number>(viewRef).pipe(
      map((views) => views ?? 0),
      catchError(() => {
        return of(0);
      })
    );
  }
}
