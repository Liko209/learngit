/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 12:41:10
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed, action } from 'mobx';
import { RouteProps } from 'react-router-dom';
import { SubModuleConfig, NavConfig } from '../types';

class HomeStore {
  @observable private _subModuleConfigs = new Map<string, SubModuleConfig>();
  @observable private _defaultRouterPaths: string[];

  @computed
  get defaultRouterPath() {
    let path = '';
    this._defaultRouterPaths.some((value: string) => {
      return Array.from(this._subModuleConfigs.values()).some(
        (subModule: SubModuleConfig) => {
          return !!(
            subModule.route &&
            subModule.route.path &&
            subModule.route.path === value
          );
        },
      )
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
    return Array.from(this._subModuleConfigs.values())
      .filter(subModule => subModule.route)
      .map(subModule => subModule.route) as RouteProps[];
  }

  @computed
  get navConfigs() {
    const hasNav = (config: SubModuleConfig) => {
      return !!config.nav;
    };

    return Array.from(this._subModuleConfigs.values())
      .filter(hasNav)
      .map(config => config.nav!()) as Promise<NavConfig>[];
  }

  getSubModule(name: string) {
    return this._subModuleConfigs.get(name);
  }

  @action
  addSubModule(name: string, config: SubModuleConfig) {
    this._subModuleConfigs.set(name, config);
  }
}

export { HomeStore, SubModuleConfig };
