import { ModuleConfig } from 'framework';
import { Upgrade } from './upgrade';
import { ServiceWorkerModule } from './ServiceWorkerModule';

const config: ModuleConfig = {
  entry: ServiceWorkerModule,
  provides: [Upgrade],
};

export { config };
