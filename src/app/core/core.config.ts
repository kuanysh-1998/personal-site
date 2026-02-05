import { ServiceWorkerUpdateService } from './services/service-worker-update/service-worker-update.service';
import { EmailjsService } from './services/emailjs/emailjs.service';
import { ThemeService } from './services/theme/theme.service';
import { LocaleService } from './services/locale/locale.service';
import { YandexMetrikaService } from './services/yandex-metrika/yandex-metrika.service';

const API_SERVICES = [];
const UTIL_SERVICES = [];
const CORE_SERVICES = [
  ServiceWorkerUpdateService,
  EmailjsService,
  ThemeService,
  LocaleService,
  YandexMetrikaService,
];

export const coreProviders = [...CORE_SERVICES];
