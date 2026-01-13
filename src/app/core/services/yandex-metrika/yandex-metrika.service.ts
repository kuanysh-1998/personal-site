import { Injectable, inject, DestroyRef } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { UnknownDynamicType } from '@app/shared/types/common.types';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import './yandex-metrika.types';

@Injectable({
  providedIn: 'root',
})
export class YandexMetrikaService {
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _counterId = 106232145;
  private readonly _scriptUrl = `https://mc.yandex.ru/metrika/tag.js?id=${this._counterId}`;

  public init(): void {
    if (!this._isMetrikaAvailable()) {
      return;
    }

    this._setupUrlChangeTracking();
  }

  public initMetrika(): void {
    if (document.readyState === 'complete') {
      this._loadMetrika();
    } else {
      window.addEventListener('load', () => this._loadMetrika(), { once: true });
    }
  }

  public pageChanged(newUrl: string, prevUrl: string | null = null): void {
    if (this._isMetrikaAvailable()) {
      window.ym(this._counterId, 'hit', newUrl, { referer: prevUrl });
    }
  }

  public sendMetricsEvent(goal: string, params: Record<string, UnknownDynamicType> = {}): void {
    if (this._isMetrikaAvailable()) {
      (window as UnknownDynamicType)['ym'](this._counterId, 'reachGoal', goal, params);
    }
  }

  private _loadMetrika(): void {
    if (this._isMetrikaAvailable()) {
      this.init();
      return;
    }

    // Проверка, не загружен ли уже скрипт
    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === this._scriptUrl) {
        return;
      }
    }

    // Инициализация функции ym до загрузки скрипта
    window.ym =
      window.ym ||
      function (...args: unknown[]): void {
        (window.ym.a = window.ym.a || []).push(args);
      };

    window.ym.l = 1 * new Date().getTime();

    // Создание и добавление скрипта
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    script.async = true;
    script.src = this._scriptUrl;
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Инициализация счетчика с новыми параметрами
    window.ym(this._counterId, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      accurateTrackBounce: true,
      trackLinks: true,
    });

    document.addEventListener(`yacounter${this._counterId}inited`, () => this.init());
  }

  private _setupUrlChangeTracking(): void {
    this._router.events
      .pipe(
        filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((e: NavigationEnd) => this.pageChanged(e.urlAfterRedirects, e.url));
  }

  private _isMetrikaAvailable(): boolean {
    return typeof window.ym === 'function';
  }
}
