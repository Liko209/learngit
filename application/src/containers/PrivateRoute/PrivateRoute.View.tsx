/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';

type RouteComponent =
  | React.StatelessComponent<RouteComponentProps<{}>>
  | React.ComponentClass<any>;

type PrivateRouteProps = {
  isAuthenticated: boolean;
  component: RouteComponent;
} & RouteComponentProps;

const PrivateRoute = ({
  location,
  isAuthenticated,
  component: Component,
}: PrivateRouteProps) => {
  if (isAuthenticated) {
    // The location props should be instilled for component could be a container
    return <Component location={location} />;
  }

  const redirectProps = {
    to: {
      pathname: '/unified-login',
      state: { from: location },
    },
  };
  return <Redirect {...redirectProps} />;
};

const PrivateRouteView = withRouter<PrivateRouteProps>(PrivateRoute);

export { PrivateRouteView };
