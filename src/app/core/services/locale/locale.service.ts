import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

import {
  AVAILABLE_LANGS,
  LOCALE_NAMES,
  LOCALE_STORAGE_KEY,
  type LocaleId,
  type LocaleOption,
} from './locale.types';

export type { LocaleId, LocaleOption } from './locale.types';

@Injectable()
export class LocaleService {
  private readonly _transloco = inject(TranslocoService);

  private readonly _currentLang = signal<LocaleId>(this._readStoredLang());

  public readonly currentLang = this._currentLang.asReadonly();
  public readonly availableOptions: LocaleOption[] = AVAILABLE_LANGS.map((id) => ({
    id,
    name: LOCALE_NAMES[id],
  }));

  constructor() {
    this._restoreLang();
  }

  /** Вызывается из APP_INITIALIZER для загрузки выбранного языка до первого рендера. */
  public init(): Promise<void> {
    const lang = this._readStoredLang();
    return firstValueFrom(this._transloco.load(lang)).then(() => {});
  }

  public setLang(lang: string): void {
    const normalized = this._normalizeLang(lang);
    if (!normalized || normalized === this._transloco.getActiveLang()) {
      return;
    }
    localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
    window.location.reload();
  }

  public getActiveLang(): LocaleId {
    return this._normalizeLang(this._transloco.getActiveLang()) ?? 'en';
  }

  private _readStoredLang(): LocaleId {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return this._normalizeLang(stored ?? '') ?? 'en';
  }

  private _normalizeLang(lang: string | null | undefined): LocaleId | null {
    if (lang && AVAILABLE_LANGS.includes(lang as LocaleId)) {
      return lang as LocaleId;
    }
    return null;
  }

  private _restoreLang(): void {
    const stored = this._readStoredLang();
    if (stored !== this._transloco.getActiveLang()) {
      this._transloco.setActiveLang(stored);
    }
    this._transloco.langChanges$.subscribe((lang) => {
      const normalized = this._normalizeLang(lang);
      if (normalized) {
        this._currentLang.set(normalized);
      }
    });
  }
}
