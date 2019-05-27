import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Switch, Route } from 'react-router-dom';
import { container } from 'framework';
import { SettingStore, emptyPageFilter } from '../../store';
import { SETTING_ROUTE_ROOT } from '../../constant';
import { SettingPage } from '../SettingPage';

@observer
class SettingRouter extends Component {
  private _settingStore = container.get(SettingStore);

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
    return <Switch>{this._renderRoutes()}</Switch>;
  }
}

export { SettingRouter };
