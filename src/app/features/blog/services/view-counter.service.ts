import { inject, Injectable } from '@angular/core';
import { Database, objectVal, ref, runTransaction } from '@angular/fire/database';
import { Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { STORAGE_KEYS } from '../../../shared/constants/storage-keys';
import { LocalStorageService } from '../../../core/services/local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ViewCounterService {
  private readonly _db = inject(Database);
  private readonly _storage = inject(LocalStorageService);

  private _hasViewedPost(postId: string): boolean {
    try {
      const viewedPosts = this._storage.get<unknown>(STORAGE_KEYS.VIEWED_POSTS);
      if (!viewedPosts) {
        return false;
      }

      if (Array.isArray(viewedPosts)) {
        return viewedPosts.includes(postId);
      }

      if (typeof viewedPosts === 'object' && viewedPosts !== null) {
        return postId in (viewedPosts as Record<string, unknown>);
      }

      return false;
    } catch {
      return false;
    }
  }

  private _markPostAsViewed(postId: string): void {
    try {
      const stored = this._storage.get<Record<string, number> | unknown>(STORAGE_KEYS.VIEWED_POSTS);
      let viewedPosts: Record<string, number>;

      if (!stored) {
        viewedPosts = {};
      } else {
        const parsed = stored;

        if (Array.isArray(parsed)) {
          viewedPosts = {};
          const now = Date.now();
          (parsed as string[]).forEach((id: string) => {
            viewedPosts[id] = now;
          });
        } else if (typeof parsed === 'object' && parsed !== null) {
          viewedPosts = parsed as Record<string, number>;
        } else {
          viewedPosts = {};
        }
      }

      viewedPosts[postId] = Date.now();

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      Object.keys(viewedPosts).forEach((key) => {
        if (viewedPosts[key] < thirtyDaysAgo) {
          delete viewedPosts[key];
        }
      });

      this._storage.set(STORAGE_KEYS.VIEWED_POSTS, viewedPosts);
    } catch {
      // ignore
    }
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
