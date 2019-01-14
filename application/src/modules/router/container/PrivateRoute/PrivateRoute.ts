/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { buildContainer } from '@/base';
import { PrivateRouteView } from './PrivateRoute.View';
import { PrivateRouteViewModel } from './PrivateRoute.ViewModel';

type RouteComponent =
  | React.StatelessComponent<RouteComponentProps<{}>>
  | React.ComponentClass<any>;

type PrivateRouteProps = {
  component: RouteComponent;
};

const PrivateRoute = buildContainer<PrivateRouteProps>({
  ViewModel: PrivateRouteViewModel,
  View: PrivateRouteView,
});

export { PrivateRoute };
