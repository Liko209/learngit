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

  getNavConfigs(currentConversationId: number, currentGroupIds: number[]) {
    const hasNav = (config: SubModuleConfig) => {
      return !!config.nav;
    };

    return this._subModuleConfigs
      .filter(hasNav)
      .map((config: { nav: (arg0: number, arg1: number[]) => NavConfig }) => {
        return config.nav(currentConversationId, currentGroupIds);
      });
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
