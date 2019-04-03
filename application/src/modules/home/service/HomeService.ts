/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 10:03:23
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { inject, Jupiter } from 'framework';
import { HomeStore, SubModuleConfig } from '../store';
import { config } from '../home.config';

class HomeService {
  @inject(Jupiter) private _jupiter: Jupiter;
  @inject(HomeStore) private _homeStore: HomeStore;

  registerSubModule(name: string) {
    const subModuleConfig = config.subModules[name];
    this._registerSubModule(subModuleConfig);
  }

  registerSubModules(names: string[]) {
    names.forEach(name => this.registerSubModule(name));
  }

  setDefaultRouterPaths(paths: string[]) {
    this._homeStore.setDefaultRouterPaths(paths);
  }

  private _registerSubModule(subModuleConfig: SubModuleConfig) {
    const config = _.cloneDeep(subModuleConfig);
    this._homeStore.addSubModule(config);

    if (config.loader) {
      this._jupiter.registerModuleAsync(config.loader, config.afterBootstrap);
    }
  }
}

export { HomeService };
