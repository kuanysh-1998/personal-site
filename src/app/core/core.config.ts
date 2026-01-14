import { ServiceWorkerUpdateService } from './services/service-worker-update/service-worker-update.service';
import { EmailjsService } from './services/emailjs/emailjs.service';

const CORE_SERVICES = [ServiceWorkerUpdateService, EmailjsService];

export const coreProviders = [...CORE_SERVICES];
