/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 13:06:16
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { RouteProps } from 'react-router-dom';

class RouterStore {
  @observable
  routes: RouteProps[] = [];
  @observable
  authRoutes: RouteProps[] = [];

  addRoute(route: RouteProps) {
    this.routes.push(route);
  }

  addAuthRoute(route: RouteProps) {
    this.authRoutes.push(route);
  }

  addRoutes(routes: RouteProps[]) {
    this.routes.push(...routes);
  }

  addAuthRoutes(routes: RouteProps[]) {
    this.authRoutes.push(...routes);
  }
}

export { RouterStore };
