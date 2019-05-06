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
    this._registerSubModule(name, subModuleConfig);
  }

  registerSubModules(names: string[]) {
    names.forEach(name => this.registerSubModule(name));
  }

  setDefaultRouterPaths(paths: string[]) {
    this._homeStore.setDefaultRouterPaths(paths);
  }

  private _registerSubModule(name: string, subModuleConfig: SubModuleConfig) {
    const config = _.cloneDeep(subModuleConfig);
    if (config.loader) {
      this._jupiter.registerModuleAsync(config.loader, config.afterBootstrap);
    }
    this._homeStore.addSubModule(name, config);
  }

  async unRegisterModule(name: string) {
    const subModuleConfig = this._homeStore.getSubModule(name);
    if (subModuleConfig && subModuleConfig.loader) {
      const { config } = await subModuleConfig.loader();
      config.entry && this._jupiter.unRegisterModule(config);
    }
  }

  hasModules(modules: string[]) {
    return modules.every(module => !!this._homeStore.getSubModule(module));
  }
}

export { HomeService };
