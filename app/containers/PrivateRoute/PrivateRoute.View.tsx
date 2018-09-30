/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router-dom';

type RouteComponent =
  | React.StatelessComponent<RouteComponentProps<{}>>
  | React.ComponentClass<any>;

type PrivateRouteProps = {
  isAuthenticated: boolean;
} & RouteProps;

const PrivateRoute = (Component?: RouteComponent) => (
  props: PrivateRouteProps,
) => {
  if (!Component) {
    return null;
  }

  const { isAuthenticated, ...rest } = props;

  if (isAuthenticated) {
    return <Component {...rest} />;
  }

  const redirectProps = {
    to: {
      pathname: '/unified-login',
      state: { from: props.location },
    },
  };
  return <Redirect {...redirectProps} />;
};

const PrivateRouteView = PrivateRoute;

export { PrivateRouteView };
