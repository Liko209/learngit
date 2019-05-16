/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 10:03:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import _ from 'lodash';
import { inject, Jupiter } from 'framework';
import { HomeStore, SubModuleConfig } from '../store';
import { config } from '../home.config';

class HomeService {
  @inject(Jupiter) private _jupiter: Jupiter;
  @inject(HomeStore) private _homeStore: HomeStore;

  async registerSubModule(name: string) {
    const subModuleConfig = config.subModules[name];
    return this._registerSubModule(name, subModuleConfig);
  }

  async registerSubModules(names: string[]) {
    const promises = names.map(name => this.registerSubModule(name));
    return Promise.all(promises);
  }

  setDefaultRouterPaths(paths: string[]) {
    this._homeStore.setDefaultRouterPaths(paths);
  }

  private async _registerSubModule(
    name: string,
    subModuleConfig: SubModuleConfig,
  ) {
    const config = _.cloneDeep(subModuleConfig);

    if (config.moduleConfigLoader) {
      await this._jupiter.registerModuleAsync(
        config.moduleConfigLoader,
        config.afterBootstrap,
      );
    } else if (config.moduleConfig) {
      this._jupiter.registerModule(config.moduleConfig, config.afterBootstrap);
    }
    this._homeStore.addSubModule(name, config);
  }

  async unRegisterModule(name: string) {
    const subModuleConfig = this._homeStore.getSubModule(name);
    if (subModuleConfig && subModuleConfig.moduleConfigLoader) {
      const { config } = await subModuleConfig.moduleConfigLoader();
      config.entry && this._jupiter.unRegisterModule(config);
    }
  }

  hasModules(modules: string[]) {
    return modules.every(module => !!this._homeStore.getSubModule(module));
  }

  registerExtension(key: string, extension: ComponentType) {
    this._homeStore.addExtensions(key, extension);
  }
}

export { HomeService };
