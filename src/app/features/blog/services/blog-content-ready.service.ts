import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogContentReadyService {
  private readonly _contentReady$ = new Subject<void>();

  public readonly contentReady$ = this._contentReady$.asObservable();

  public notify(): void {
    this._contentReady$.next();
  }
}
