import { TranslocoHttpLoader } from './loaders/transloco-http.loader';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { ServiceWorkerUpdateService } from './services/service-worker-update/service-worker-update.service';
import { EmailjsService } from './services/emailjs/emailjs.service';
import { ThemeService } from './services/theme/theme.service';
import { LocaleService } from './services/locale/locale.service';
import { YandexMetrikaService } from './services/yandex-metrika/yandex-metrika.service';
import { SeoService } from './services/seo/seo.service';

const API_SERVICES = [];
const UTIL_SERVICES = [];
const CORE_SERVICES = [
  LocalStorageService,
  ServiceWorkerUpdateService,
  EmailjsService,
  ThemeService,
  LocaleService,
  YandexMetrikaService,
  SeoService,
];
const CORE_LOADERS = [TranslocoHttpLoader];

export const coreProviders = [...CORE_SERVICES, ...CORE_LOADERS];
