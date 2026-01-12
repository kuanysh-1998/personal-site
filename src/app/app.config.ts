import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideMarkdown } from 'ngx-markdown';
import { coreProviders } from './core/core.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAngularSvgIcon(),
    provideMarkdown(),
    provideServiceWorker('ngsw-worker.js', {
      registrationStrategy: 'registerWhenStable:3000',
    }),
    ...coreProviders,
  ],
};
