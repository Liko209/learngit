/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { observer } from 'mobx-react';
import { PrivateRouteViewProps } from './types';

@observer
class PrivateRoute extends Component<PrivateRouteViewProps> {
  render() {
    const { isAuthenticated, component: Component, ...rest } = this.props;
    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/unified-login',
                state: { from: props.location },
              }}
            />
          )
        }
      />
    );
  }
}

const PrivateRouteView = PrivateRoute;

export { PrivateRouteView };
