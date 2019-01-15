import { inject } from 'framework';
import { HomeStore, SubModuleConfig } from '../store';
import { HomeConfig } from '../types';

class HomeService {
  @inject(HomeStore)
  private readonly _homeStore: HomeStore;

  loadConfig(config: HomeConfig) {
    this.setDefaultRouterPath(config.defaultRouterPath);
    this.registerSubModules(config.subModules);
  }

  setDefaultRouterPath(path: string) {
    this._homeStore.setDefaultRouterPath(path);
  }

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
