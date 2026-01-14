import { inject, Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ViewCounterService {
  private readonly _db = inject(AngularFireDatabase);

  public incrementView(postId: string): Observable<number> {
    const viewRef = this._db.object<number>(`/post-views/${postId}`);
    return from(viewRef.query.ref.transaction((currentViews) => (currentViews || 0) + 1)).pipe(
      map((result) => {
        if (result.committed && result.snapshot.val() !== null) {
          return result.snapshot.val();
        }
        throw new Error('Transaction failed');
      })
    );
  }

  public getViewCount(postId: string): Observable<number> {
    return this._db
      .object<number>(`/post-views/${postId}`)
      .valueChanges()
      .pipe(map((views) => views ?? 0));
  }
}
