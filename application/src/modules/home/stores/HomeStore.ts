/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 12:41:10
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import { RouteProps } from 'react-router-dom';
import { SubModuleConfig } from '../types';

class HomeStore {
  @observable
  subModuleConfigs: SubModuleConfig[] = [];

  @computed
  get subRoutes() {
    return this.subModuleConfigs
      .filter(subModule => subModule.route)
      .map(subModule => subModule.route) as RouteProps[];
  }

  getNavConfigs(currentConversationId: number, currentGroupIds: number[]) {
    const hasNav = (config: SubModuleConfig) => {
      return !!config.nav;
    };

    return this.subModuleConfigs
      .filter(hasNav)
      .map((config: SubModuleConfig) => {
        return config.nav!(currentConversationId, currentGroupIds);
      });
  }

  addSubModule(route: SubModuleConfig) {
    this.subModuleConfigs.push(route);
  }

  addSubSubModules(routes: SubModuleConfig[]) {
    routes.forEach(route => this.addSubModule(route));
  }
}

export { HomeStore, SubModuleConfig };
