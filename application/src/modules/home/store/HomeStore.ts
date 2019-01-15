/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 12:41:10
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed, action } from 'mobx';
import { RouteProps } from 'react-router-dom';
import { SubModuleConfig, NavConfig } from '../types';

class HomeStore {
  @observable private _subModuleConfigs: SubModuleConfig[] = [];
  @observable private _defaultRouterPath: string;

  @computed
  get defaultRouterPath() {
    return this._defaultRouterPath;
  }

  @action
  setDefaultRouterPath(path: string) {
    this._defaultRouterPath = path;
  }

  @computed
  get subRoutes() {
    return this._subModuleConfigs
      .filter(subModule => subModule.route)
      .map(subModule => subModule.route) as RouteProps[];
  }

  @computed
  get navConfigs() {
    const hasNav = (
      config: SubModuleConfig,
    ): config is { nav: () => NavConfig } => {
      return !!config.nav;
    };

    return this._subModuleConfigs.filter(hasNav).map(config => config.nav());
  }

  @action
  addSubModule(config: SubModuleConfig) {
    this._subModuleConfigs.push(config);
  }

  @action
  addSubSubModules(configs: SubModuleConfig[]) {
    configs.forEach(route => this.addSubModule(route));
  }
}

export { HomeStore, SubModuleConfig };
