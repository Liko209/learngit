/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 12:41:10
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { observable, computed, action } from 'mobx';
import { RouteProps } from 'react-router-dom';
import { SubModuleConfig, NavConfig } from '../types';
// import { config } from '../home.config';

class HomeStore {
  @observable private _subModuleConfigsMap = new Map<string, SubModuleConfig>();
  @observable private _subRouteMap = new Map<string, RouteProps>();
  @observable private _navConfigMap = new Map<string, NavConfig>();
  @observable private _defaultRouterPaths: string[] = [];

  @computed
  get subRoutes() {
    return [...this._subRouteMap.values()];
  }
  @computed
  get navConfigs() {
    return [...this._navConfigMap.values()];
  }

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

  getSubModule(name: string) {
    return this._subModuleConfigsMap.get(name);
  }

  @action
  addSubModule(name: string, config: SubModuleConfig) {
    this._subModuleConfigsMap.set(name, config);
  }

  @action
  addRoute(name: string, route: RouteProps) {
    this._subRouteMap.set(name, route);
  }

  @action
  addNavItem(name: string, navItemConfig: NavConfig) {
    this._navConfigMap.set(name, navItemConfig);
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
