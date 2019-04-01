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
  @observable private _defaultRouterPaths: string[];

  @computed
  get defaultRouterPath() {
    let path = '';
    this._defaultRouterPaths.some((value: string) => {
      return this._subModuleConfigs.some((subModule: SubModuleConfig) => {
        return !!(
          subModule.route &&
          subModule.route.path &&
          subModule.route.path === value
        );
      })
        ? ((path = value), true)
        : false;
    });

    return path;
  }

  @action
  setDefaultRouterPaths(paths: string[]) {
    this._defaultRouterPaths = paths;
  }

  @computed
  get subRoutes() {
    return this._subModuleConfigs
      .filter(subModule => subModule.route)
      .map(subModule => subModule.route) as RouteProps[];
  }

  @computed
  get navConfigs() {
    const hasNav = (config: SubModuleConfig) => {
      return !!config.nav;
    };

    return this._subModuleConfigs
      .filter(hasNav)
      .map(config => config.nav!()) as Promise<NavConfig>[];
  }

  @action
  addSubModule(config: SubModuleConfig) {
    this._subModuleConfigs.push(config);
  }

  @action
  addSubModules(configs: SubModuleConfig[]) {
    configs.forEach(config => this.addSubModule(config));
  }
}

export { HomeStore, SubModuleConfig };
