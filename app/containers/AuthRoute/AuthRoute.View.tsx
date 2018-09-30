/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { Route, RouteComponentProps, RouteProps } from 'react-router-dom';
import { parse } from 'qs';
import { PrivateRoute } from '@/containers/PrivateRoute';
import { TokenRoute } from '@/containers/TokenRoute';

type RouteComponent =
  | React.StatelessComponent<RouteComponentProps<{}>>
  | React.ComponentClass<any>;

const AuthRouteView: React.StatelessComponent<RouteProps> = ({
  component,
  ...rest
}) => {
  const params = parse(window.location.search, { ignoreQueryPrefix: true });
  if (params.code || params.id_token) {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Glip User (Free User)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    return <Route {...rest} component={TokenRoute} />;
  }
  return <Route {...rest} render={PrivateRoute(component)} />;
};

export { AuthRouteView };
