/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import ThemeProvider from '@/containers/ThemeProvider';

import { AuthRoute } from '@/containers/AuthRoute';
import Login from '@/containers/Login';
import Home from '@/containers/Home';
import UnifiedLogin from '@/containers/UnifiedLogin';
import VersionInfo from '@/containers/VersionInfo';
import { TimerDemo, InfiniteListDemo } from '@/containers/Demo';
import history from '@/utils/history';

class App extends React.PureComponent {
  public render() {
    return (
      <ThemeProvider>
        <Router history={history}>
          <Switch>
            <Route path="/commit-info" component={VersionInfo} />
            <Route path="/version" component={VersionInfo} />
            <Route path="/login" component={Login} />
            <Route path="/unified-login" component={UnifiedLogin} />
            <Route path="/demo/timer" component={TimerDemo} />
            <Route path="/demo/infinite-list" component={InfiniteListDemo} />
            <AuthRoute path="/" component={Home} />
          </Switch>
        </Router>
      </ThemeProvider>
    );
  }
}

export default hot(module)(App);
