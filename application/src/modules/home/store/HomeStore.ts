/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 12:41:10
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed, action } from 'mobx';
import { RouteProps } from 'react-router-dom';
import { SubModuleConfig, NavConfig } from '../types';
import { config } from '../home.config';
class HomeStore {
  @observable private _subModuleConfigsMap = new Map<string, SubModuleConfig>();
  @observable private _defaultRouterPaths: string[];

  @computed
  get subModuleConfigs() {
    return Array.from(this._subModuleConfigsMap.values());
  }

  @computed
  get defaultRouterPath() {
    let path = '';
    this._defaultRouterPaths.some((value: string) => {
      return this.subModuleConfigs.some((subModule: SubModuleConfig) => {
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
    return this.subModuleConfigs
      .filter(subModule => subModule.route)
      .map(subModule => subModule.route) as RouteProps[];
  }

  @computed
  get navConfigs() {
    const hasNav = (config: SubModuleConfig) => {
      return !!config.nav;
    };

    const { subModules } = config;
    const resultConfigs: SubModuleConfig[] = [];

    Object.keys(subModules).forEach(subModuleName => {
      if (this._subModuleConfigsMap.has(subModuleName)) {
        const subModule = this.getSubModule(subModuleName);
        subModule && resultConfigs.push(subModule);
      }
    });

    return resultConfigs.filter(hasNav).map(config => config.nav!()) as Promise<
      NavConfig
    >[];
  }

  getSubModule(name: string) {
    return this._subModuleConfigsMap.get(name);
  }

  @action
  addSubModule(name: string, config: SubModuleConfig) {
    this._subModuleConfigsMap.set(name, config);
  }
}

export { HomeStore, SubModuleConfig };
