/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 17:09:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Route } from 'react-router-dom';
import { jupiter } from 'framework';
import { SettingStore } from '../../store';
import { SETTING_ROUTE_ROOT } from '../../constant';
import { SettingPage } from '../SettingPage';

type SettingRouteProps = { pageId: string };

@observer
class SettingRoute extends Component<SettingRouteProps> {
  private get _settingStore() {
    return jupiter.get(SettingStore);
  }

  @computed
  get path() {
    const page = this._settingStore.getPageById(this.props.pageId);
    return page ? page.path : '';
  }

  @computed
  private get _Component() {
    return () => <SettingPage id={this.props.pageId} />;
  }

  render() {
    return (
      <Route
        path={`${SETTING_ROUTE_ROOT}${this.path}`}
        component={this._Component}
      />
    );
  }
}

export { SettingRoute, SettingRouteProps };
