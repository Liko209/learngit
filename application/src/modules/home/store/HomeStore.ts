/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 12:41:10
 * Copyright © RingCentral. All rights reserved.
 */

import { ComponentType } from 'react';
import { observable, computed, action } from 'mobx';
import { RouteProps } from 'react-router-dom';
import { SubModuleConfig, NavConfig } from '../types';
import { config } from '../home.config';
class HomeStore {
  @observable private _subModuleConfigsMap = new Map<string, SubModuleConfig>();
  @observable private _defaultRouterPaths: string[] = [];

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
    return Object.keys(config.subModules)
      .filter(moduleName => this._subModuleConfigsMap.has(moduleName))
      .map(moduleName => this.getSubModule(moduleName))
      .filter(config => !!config && !!config.nav)
      .map(config => !!config && config.nav!()) as Promise<NavConfig>[];
  }

  getSubModule(name: string) {
    return this._subModuleConfigsMap.get(name);
  }

  @action
  addSubModule(name: string, config: SubModuleConfig) {
    this._subModuleConfigsMap.set(name, config);
  }

  @observable extensions: { [key: string]: Set<ComponentType> } = {};

  addExtensions(key: string, extension: ComponentType) {
    if (this.extensions[key]) {
      this.extensions[key].add(extension);
      return;
    }
    this.extensions[key] = new Set([extension]);
  }
}

export { HomeStore, SubModuleConfig };
