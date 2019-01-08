import { RouterStore } from './stores';
import { RouterService } from './service';
import { RouterModule } from './RouterModule';

const config = {
  entry: RouterModule,
  provides: { RouterStore, RouterService },
};

export { config };
