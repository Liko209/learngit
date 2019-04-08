/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter, Switch, Route } from 'react-router';
import { observer } from 'mobx-react';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { SettingLeftRail } from '../SettingLeftRail';
import history from '@/history';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { General } from '../General';
import { Messaging } from '../Messaging';

type SettingWrapperPops = RouteComponentProps<{ subPath: string }>;

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

  render() {
    const { match } = this.props;
    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive type={match.params.subPath} />
        <SwitchResponsive>
          <Route path={'/settings/loading'} render={() => 'loading'} />
          <Route path={'/settings/general'} render={() => <General />} />
          <Route
            path={'/settings/notification_and_sounds'}
            render={() => 'notification_and_sounds'}
          />
          <Route path={'/settings/messaging'} render={() => <Messaging />} />
          <Route path={'/settings/phone'} render={() => 'phone'} />
          <Route path={'/settings/meetings'} render={() => 'meetings'} />
          <Route path={'/settings/calendar'} render={() => 'calendar'} />
        </SwitchResponsive>
      </JuiResponsiveLayout>
    );
  }
}

const SettingRouter = withRouter(SettingRouterComponent);

export { SettingRouter };
