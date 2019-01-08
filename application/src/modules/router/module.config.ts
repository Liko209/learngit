import { RouterStore } from './stores';
import { RouterService } from './services';
import { RouterModule } from './RouterModule';

const config = {
  entry: RouterModule,
  provides: { RouterStore, RouterService },
};

export { config };
