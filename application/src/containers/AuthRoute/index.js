/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 13:59:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";

import { service } from "sdk";

const { AuthService } = service;

const AuthRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = AuthService.getInstance().isLoggedIn();
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/unified-login",
              state: { from: props.location } // eslint-disable-line
            }}
          />
        )
      }
    />
  );
};

AuthRoute.propTypes = {
  component: PropTypes.func.isRequired
};

export default AuthRoute;
