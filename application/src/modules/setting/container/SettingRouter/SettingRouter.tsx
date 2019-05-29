/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 17:09:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import {
  Switch,
  Redirect,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { jupiter } from 'framework';
import { ISettingService } from '@/interface/setting';
import { SettingStore } from '../../store';
import { SETTING_ROUTE_ROOT } from '../../constant';
import { SettingRoute } from './SettingRoute';

@observer
class SettingRouterComponent extends Component<RouteComponentProps> {
  private get _settingStore() {
    return jupiter.get(SettingStore);
  }

  private get _settingService() {
    return jupiter.get<ISettingService>(ISettingService);
  }

  @computed
  get pageIds() {
    return this._settingStore.getNoEmptyPages();
  }

  componentDidMount() {
    if (!this._settingStore.currentPage) {
      const defaultPage = this.pageIds[0];
      if (defaultPage) {
        this._settingService.goToSettingPage(defaultPage);
      }
    }
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

  private _renderRoutes() {
    return this.pageIds.map(pageId => (
      <SettingRoute key={pageId} pageId={pageId} />
    ));
  }
}

const SettingRouter = withRouter(SettingRouterComponent);
export { SettingRouter };
