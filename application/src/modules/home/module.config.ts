import { HomeService } from './services';
import { HomeStore } from './stores';
import { HomeModule } from './HomeModule';

const config = {
  entry: HomeModule,
  provides: { HomeStore, HomeService },
};

export { config };
