import { inject, Injectable } from '@angular/core';
import { Database, objectVal, ref, runTransaction } from '@angular/fire/database';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { STORAGE_KEYS } from '../../../shared/constants/storage-keys';
import { LocalStorageService } from '../../../core/services/local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LikeCounterService {
  private readonly _db = inject(Database);
  private readonly _storage = inject(LocalStorageService);

  public hasLikedPost(postId: string): boolean {
    try {
      const likedPosts = this._storage.get<Record<string, boolean>>(STORAGE_KEYS.LIKED_POSTS);
      return likedPosts?.[postId] === true;
    } catch {
      return false;
    }
  }

  private _markPostAsLiked(postId: string): void {
    try {
      const likedPosts = this._storage.get<Record<string, boolean>>(STORAGE_KEYS.LIKED_POSTS) ?? {};
      this._storage.set(STORAGE_KEYS.LIKED_POSTS, { ...likedPosts, [postId]: true });
    } catch {
      // ignore
    }
  }

  public incrementLike(postId: string): Observable<number> {
    if (!postId || this.hasLikedPost(postId)) {
      return of(0);
    }

    this._markPostAsLiked(postId);

    const likeRef = ref(this._db, `post-likes/${postId}`);
    return from(
      runTransaction(likeRef, (current: number | null) => {
        return (current || 0) + 1;
      }),
    ).pipe(
      map((result) => {
        if (result.committed && result.snapshot.val() !== null) {
          return result.snapshot.val() as number;
        }
        throw new Error('Transaction failed');
      }),
      catchError(() => {
        return of(0);
      }),
    );
  }

  public getLikeCount(postId: string): Observable<number> {
    if (!postId) {
      return of(0);
    }

    const likeRef = ref(this._db, `post-likes/${postId}`);
    return objectVal<number>(likeRef).pipe(
      map((likes) => likes ?? 0),
      catchError(() => {
        return of(0);
      }),
    );
  }
}
