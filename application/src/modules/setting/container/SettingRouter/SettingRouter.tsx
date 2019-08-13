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
  withRouter,
  RouteComponentProps,
  Route,
} from 'react-router-dom';
import { jupiter } from 'framework/Jupiter';
import { ISettingService } from '@/interface/setting';
import { SettingStore } from '../../store';
import { SETTING_ROUTE_ROOT } from '../../constant';
import { SettingPage } from '../SettingPage';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { SettingLeftRail } from '../SettingLeftRail';

const LeftRailResponsive = withResponsive(SettingLeftRail, {
  maxWidth: 360,
  minWidth: 200,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.AUTOMATIC,
  enable: {
    right: true,
  },
  priority: 1,
});

const SwitchResponsive = withResponsive(Switch, {
  minWidth: 400,
  priority: 2,
});

type SettingRouterPops = RouteComponentProps<{ subPath: string }>;

@observer
class SettingRouterComponent extends Component<SettingRouterPops> {
  componentDidMount() {
    if (!this.props.match.params.subPath) {
      if (this._settingStore.currentPage) {
        this._settingService.goToSettingPage(
          this._settingStore.currentPage.id,
          { replace: true },
        );
      } else {
        const defaultPage = this.pageIds[0];
        this._settingService.goToSettingPage(defaultPage, { replace: true });
      }
    }
  }
  getPath(pageId: string) {
    const page = this._settingStore.getPageById(pageId);
    return page ? page.path : '';
  }
  @computed
  get pageIds() {
    return this._settingStore.getAllPages();
  }
  private get _settingStore() {
    return jupiter.get(SettingStore);
  }

  private get _settingService() {
    return jupiter.get<ISettingService>(ISettingService);
  }
  private _renderRoutes() {
    return this.pageIds.map(pageId => (
      <Route
        key={pageId}
        path={`${SETTING_ROUTE_ROOT}${this.getPath(pageId)}`}
        render={() => <SettingPage id={pageId} />}
      />
    ));
  }
  render() {
    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive />
        <SwitchResponsive>{this._renderRoutes()}</SwitchResponsive>
      </JuiResponsiveLayout>
    );
  }
}

const SettingRouter = withRouter(SettingRouterComponent);
export { SettingRouter };
