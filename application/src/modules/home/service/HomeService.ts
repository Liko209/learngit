/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 10:03:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { RouteProps } from 'react-router-dom';
import _ from 'lodash';
import { inject } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { HomeStore, SubModuleConfig } from '../store';
import { config } from '../home.config';
import { IHomeService } from '../interface/IHomeService';
import { NavConfig } from '../types';

class HomeService implements IHomeService {
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

  registerNavItem(moduleName: string, navItemConfig: NavConfig): void {
    this._homeStore.addNavItem(moduleName, navItemConfig);
  }

  unRegisterNavItem(moduleName: string): void {
    this._homeStore.removeNavItem(moduleName);
  }

  registerRoute(moduleName: string, route: RouteProps): void {
    this._homeStore.addRoute(moduleName, route);
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
    config.route && this._homeStore.addRoute(name, config.route);
    config.nav && this._homeStore.addNavItem(name, await config.nav());
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
