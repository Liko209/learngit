/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { hot } from "react-hot-loader";
import ThemeProvider from "@/containers/ThemeProvider";
import StoreContext from "@/store/context";
import storeManager from "@/store";

import "@/App.css";

import AuthRoute from "@/containers/AuthRoute";
import Login from "@/containers/Login";
import Home from "@/containers/Home";
import UnifiedLogin from "@/containers/UnifiedLogin";

class App extends React.PureComponent {
  public render() {
    return (
      <ThemeProvider>
        <StoreContext.Provider value={storeManager}>
          <Router>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/unified-login" component={UnifiedLogin} />
              <AuthRoute path="/" component={Home} />
            </Switch>
          </Router>
        </StoreContext.Provider>
      </ThemeProvider>
    );
  }
}

export default hot(module)(App);
