import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { THEME_STORAGE_KEY, Theme } from './theme.types';

@Injectable()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _storage = this._document.defaultView?.localStorage;

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
    const stored = this._storage?.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (this._document.defaultView?.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  private _applyTheme(value: Theme): void {
    const root = this._document.documentElement;
    root.setAttribute('data-theme', value);
  }

  private _persist(value: Theme): void {
    this._storage?.setItem(THEME_STORAGE_KEY, value);
  }
}
