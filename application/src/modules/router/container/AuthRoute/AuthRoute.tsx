/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { parse } from 'qs';
import { PrivateRoute } from '../PrivateRoute';
import { TokenRoute } from '../TokenRoute';

const AuthRoute: React.StatelessComponent<RouteProps> = ({
  component,
  ...rest
}: RouteProps) => {
  const params = parse(window.location.search, { ignoreQueryPrefix: true });
  if (params.code || params.id_token || params.t) {
    // RC user
    // http://localhost:3000/?state=STATE&code=CODE
    // Glip only user
    // http://localhost:3000/?state=STATE&t=TOKEN
    // Google user
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    return <Route {...rest} component={TokenRoute} />;
  }
  if (component) {
    return <PrivateRoute {...rest} component={component} />;
  }
  return null;
};

export { AuthRoute };
