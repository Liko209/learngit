import { Upgrade } from './upgrade';
import { ServiceWorkerModule } from './ServiceWorkerModule';

const config = {
  entry: ServiceWorkerModule,
  provides: [Upgrade],
};

export { config };
