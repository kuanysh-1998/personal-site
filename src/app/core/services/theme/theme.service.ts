import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../../../shared/constants/storage-keys';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Theme } from './theme.types';

@Injectable()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _storage = inject(LocalStorageService);

  public readonly theme = signal<Theme>(this._resolveInitialTheme());

  constructor() {
    this._applyTheme(this.theme());
  }

  public setTheme(value: Theme): void {
    this.theme.set(value);
    this._persist(value);
    this._applyTheme(value);
  }

  public toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private _resolveInitialTheme(): Theme {
    const stored = this._storage.get<Theme>(STORAGE_KEYS.THEME);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'dark';
  }

  private _applyTheme(value: Theme): void {
    const root = this._document.documentElement;
    root.setAttribute('data-theme', value);
  }

  private _persist(value: Theme): void {
    this._storage.set(STORAGE_KEYS.THEME, value);
  }
}
