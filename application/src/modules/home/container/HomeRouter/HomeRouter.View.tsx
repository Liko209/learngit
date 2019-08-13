/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:28:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  Redirect,
  Route,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { observer } from 'mobx-react';
// @ts-ignore
import { CacheSwitch, CacheRoute } from 'react-router-cache-route';
import { HomeRouterViewProps } from './types';
import { RouteConfig } from '../../types';

const Empty = () => <div />;

const behavior = (cached: boolean) =>
  cached
    ? { style: { display: 'none', overflowX: 'auto', width: '100%' } }
    : { style: { overflowX: 'auto', width: '100%' } };
/* eslint-disable react/no-array-index-key */
const HomeRouterViewComponent = observer(
  ({
    routes,
    defaultRouterPath,
  }: HomeRouterViewProps & RouteComponentProps) => (
    <CacheSwitch>
      {defaultRouterPath && <Redirect exact from="/" to={defaultRouterPath} />}
      {routes.map((route: RouteConfig, i: number) =>
        route.cache ? (
          <CacheRoute key={`HOME_ROUTE_${i}`} behavior={behavior} {...route} />
        ) : (
          <Route key={`HOME_ROUTE_${i}`} {...route} />
        ),
      )}
      <Route component={Empty} />
    </CacheSwitch>
  ),
);

const HomeRouterView = withRouter(HomeRouterViewComponent);

export { HomeRouterView };
