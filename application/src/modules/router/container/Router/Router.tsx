/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:22:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import {
  Router as ReactRouter,
  Switch,
  Route,
  RouteProps,
} from 'react-router-dom';
import { container } from 'framework/ioc';
import history from '@/history';
import { RouterStore } from '../../store/RouterStore';
import { AuthRoute } from '../AuthRoute';
/* eslint-disable */
class Router extends React.Component {
  private readonly _routerStore: RouterStore = container.get(RouterStore);

  render() {
    return (
      <ReactRouter history={history}>
        <Switch>
          {this._routerStore.routes.map((routeProps: RouteProps, i) => (
            <Route key={`ROUTE_${i}`} {...routeProps} />
          ))}
          {this._routerStore.authRoutes.map((routeProps: RouteProps, i) => (
            <AuthRoute key={`AUTH_ROUTE_${i}`} {...routeProps} />
          ))}
        </Switch>
      </ReactRouter>
    );
  }
}

export { Router };
