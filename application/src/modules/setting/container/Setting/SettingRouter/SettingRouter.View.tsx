/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withRouter, Switch, Route } from 'react-router';
import { observer } from 'mobx-react';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { SettingLeftRail } from '../../SettingLeftRail';
import history from '@/history';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { SettingContainer } from '../SettingContainer';
import { SettingWrapperPops } from './types';
import { SETTING_ITEM } from '../../constants';

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

@observer
class SettingRouterComponent extends Component<SettingWrapperPops> {
  componentDidMount() {
    const currentSettingType = getGlobalValue(
      GLOBAL_KEYS.CURRENT_SETTING_LIST_TYPE,
    );
    if (currentSettingType === '') {
      history.replace('/settings/general');
    } else {
      history.replace(`/settings/${currentSettingType}`);
    }
  }

  renderRouter = () => {
    const { leftRailItemIds } = this.props;
    return (
      <>
        {leftRailItemIds.map(id => {
          return (
            <Route
              key={id}
              path={`/settings/${SETTING_ITEM[id].type}`}
              render={() => <SettingContainer leftRailItemId={id} />}
            />
          );
        })}
      </>
    );
  }

  render() {
    const { match, leftRailItemIds, updateCurrentLeftRailId } = this.props;
    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive
          type={match.params.subPath}
          leftRailItemIds={leftRailItemIds}
          onClick={updateCurrentLeftRailId}
        />
        <SwitchResponsive>
          <Route path={'/settings/loading'} render={() => 'loading'} />
          {this.renderRouter()}
        </SwitchResponsive>
      </JuiResponsiveLayout>
    );
  }
}

const SettingRouterView = withRouter(SettingRouterComponent);

export { SettingRouterView };
