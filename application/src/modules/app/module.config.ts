import { AppModule } from './AppModule';
import { AppStore } from './store';

const config = {
  entry: AppModule,
  provides: { AppStore },
};

export { config };
