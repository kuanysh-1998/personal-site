import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@ngneat/transloco';

@Injectable()
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly _http = inject(HttpClient);

  public getTranslation(lang: string) {
    return this._http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
