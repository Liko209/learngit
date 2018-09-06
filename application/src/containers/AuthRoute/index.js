/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 13:59:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { parse } from 'qs';

import { service } from "sdk";
import TokenGetter from './TokenGetter';

const AuthRoute = ({ component: Component, ...rest }) => {

  const params = parse(window.location.search, { ignoreQueryPrefix: true });
  if (params.code || params.id_token) {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Glip User (Free User)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    return <Route {...rest} component={TokenGetter} />
  }

  const isAuthenticated = service.AuthService.getInstance().isLoggedIn();
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
