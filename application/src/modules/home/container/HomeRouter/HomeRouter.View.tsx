/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:28:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  Redirect,
  Route,
  RouteProps,
  Switch,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { HomeRouterViewProps } from './types';

const Empty = () => <div />;

const HomeRouterViewComponent = ({
  routes,
  defaultRouterPath,
}: HomeRouterViewProps & RouteComponentProps) => (
  <Switch>
    <Redirect exact={true} from="/" to={defaultRouterPath} />
    {routes.map((route: RouteProps, i: number) => (
      <Route key={`HOME_ROUTE_${i}`} {...route} />
    ))}
    <Route component={Empty} />
  </Switch>
);

const HomeRouterView = withRouter(HomeRouterViewComponent);

export { HomeRouterView };
