import * as React from 'react';
import {
  Router as ReactRouter,
  Switch,
  Route,
  RouteProps,
} from 'react-router-dom';
import { container } from 'framework';
import history from '../../../../history';
import { RouterStore } from '../../store/RouterStore';
import { AuthRoute } from '../AuthRoute';

class Router extends React.Component {
  private readonly _routerStore: RouterStore = container.get(RouterStore);

  render() {
    return (
      <ReactRouter history={history}>
        <Switch>
          {this._routerStore.routes.map((routeProps: RouteProps, i) => (
            <Route key={`ROUTE_${i}`} {...routeProps} />
          ))}
          {this._routerStore.authRoutes.map((routeProps: RouteProps, i) => (
            <AuthRoute key={`AUTH_ROUTE_${i}`} {...routeProps} />
          ))}
          {/* <Route path="/commit-info" component={VersionInfo} />
          <Route path="/version" component={VersionInfo} />
          <Route path="/login" component={Login} />
          <Route path="/unified-login" component={UnifiedLogin} /> */}
          {/* <AuthRoute path="/" component={Home} /> */}
        </Switch>
      </ReactRouter>
    );
  }
}

export { Router };
