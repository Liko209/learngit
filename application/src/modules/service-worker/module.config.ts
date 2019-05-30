import { ModuleConfig, Jupiter } from 'framework';
import { Upgrade } from './upgrade';
import { ServiceWorkerModule } from './ServiceWorkerModule';

const config: ModuleConfig = {
  entry: ServiceWorkerModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerClass(Upgrade);
  },
};

export { config };
