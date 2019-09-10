/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 13:25:07
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteProps } from 'react-router-dom';
import { inject } from 'framework/ioc';
import { RouterStore } from '../store/RouterStore';

type RegisterRouteConfig = RouteProps & { needAuth?: boolean };

class RouterService {
  @inject(RouterStore)
  private _routerStore: RouterStore;

  registerRoute({ needAuth, ...route }: RegisterRouteConfig) {
    if (needAuth) {
      this._routerStore.addAuthRoute(route);
      return;
    }

    this._routerStore.addRoute(route);
  }

  registerRoutes(registerConfigs: RegisterRouteConfig[]) {
    registerConfigs.forEach((config: RegisterRouteConfig) => {
      this.registerRoute(config);
    });
  }
}

export { RouterService };
