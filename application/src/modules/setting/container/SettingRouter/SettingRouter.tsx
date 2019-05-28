import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Switch,
  Route,
  Redirect,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { jupiter } from 'framework';
import { SettingStore, emptyPageFilter } from '../../store';
import { SETTING_ROUTE_ROOT } from '../../constant';
import { SettingPage } from '../SettingPage';
import { ISettingService } from '@/interface/setting';

@observer
class SettingRouterComponent extends Component<RouteComponentProps> {
  private get _settingStore() {
    return jupiter.get(SettingStore);
  }

  private get _settingService() {
    return jupiter.get<ISettingService>(ISettingService);
  }

  componentDidMount() {
    if (!this._settingStore.currentPage) {
      this._settingService.goToSettingPage(
        this._settingStore.pages.filter(emptyPageFilter)[0].id,
      );
    }
  }

  private _renderRoutes() {
    return this._settingStore.pages.filter(emptyPageFilter).map(page => {
      return (
        <Route
          key={page.id}
          path={`${SETTING_ROUTE_ROOT}${page.path}`}
          component={() => <SettingPage id={page.id} />}
        />
      );
    });
  }

  render() {
    return (
      <Switch>
        <Redirect
          exact={true}
          from={`${SETTING_ROUTE_ROOT}`}
          // TODO remove hard code
          to={`${SETTING_ROUTE_ROOT}/phone`}
        />
        {this._renderRoutes()}
      </Switch>
    );
  }
}

const SettingRouter = withRouter(SettingRouterComponent);
export { SettingRouter };
