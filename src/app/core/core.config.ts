import { ServiceWorkerUpdateService } from './services/service-worker-update/service-worker-update.service';

const CORE_SERVICES = [ServiceWorkerUpdateService];

export const coreProviders = [...CORE_SERVICES];
