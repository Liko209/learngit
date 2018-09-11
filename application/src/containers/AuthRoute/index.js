/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:17
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { parse } from 'qs';

import TokenGetter from './TokenGetter';
import ViewModel from './ViewModel';

const AuthRoute = ({ component: Component, ...rest }) => {

  const params = parse(window.location.search, { ignoreQueryPrefix: true });
  if (params.code || params.id_token) {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Glip User (Free User)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    return <Route {...rest} component={TokenGetter} />
  }

  const vm = new ViewModel();
  const { isAuthenticated } = vm;
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
