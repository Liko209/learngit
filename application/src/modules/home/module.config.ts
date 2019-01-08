import { HomeService } from './service';
import { HomeStore } from './store';
import { HomeModule } from './HomeModule';

const config = {
  entry: HomeModule,
  provides: { HomeStore, HomeService },
};

export { config };
