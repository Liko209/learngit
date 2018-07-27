/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-07 15:09:49
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-26 14:53:13
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { service } from 'sdk';

const { AuthService } = service;
const AuthRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = AuthService.getInstance().isLoggedIn();
  return (
    <Route
      {...rest}
      render={props =>
        (isAuthenticated ? (
          <Component {...props} />
        ) : (
            <Redirect
              to={{
                pathname: '/unified-login',
                state: { from: props.location } // eslint-disable-line
              }}
            />
          ))
      }
    />
  );
};

AuthRoute.propTypes = {
  component: PropTypes.func.isRequired
};

export default AuthRoute;
