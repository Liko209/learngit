import { inject } from 'framework';
import { HomeStore, SubModuleConfig } from '../store';

class HomeService {
  @inject(HomeStore)
  private readonly _homeStore: HomeStore;

  registerSubModule(subModuleConfig: SubModuleConfig) {
    this._homeStore.addSubModule(subModuleConfig);
  }

  registerSubModules(subModuleConfigs: SubModuleConfig[]) {
    subModuleConfigs.forEach(subModuleConfig =>
      this.registerSubModule(subModuleConfig),
    );
  }
}

export { HomeService };
