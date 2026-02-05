import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideTransloco } from '@ngneat/transloco';

import { routes } from './app.routes';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideMarkdown } from 'ngx-markdown';
import { coreProviders } from './core/core.config';
import { environment } from '../environments/environment';
import { TranslocoHttpLoader } from './core/loaders/transloco-http.loader';
import { LocaleService } from './core/services/locale/locale.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const locale = inject(LocaleService);
      return locale.init();
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAngularSvgIcon(),
    provideMarkdown(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ru', 'kk'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          useFallbackTranslation: true,
        },
      },
      loader: TranslocoHttpLoader,
    }),
    provideServiceWorker('ngsw-worker.js', {
      registrationStrategy: 'registerWhenStable:3000',
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideDatabase(() => getDatabase()),
    ...coreProviders,
  ],
};
