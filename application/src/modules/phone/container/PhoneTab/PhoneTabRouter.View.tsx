/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 15:31:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import {
  LeftRail,
  TelephonyTabs,
  kDefaultPhoneTabPath,
  isValidTab,
} from '../LeftRail';
import { PhoneTabViewProps } from './types';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { withRouter, Switch, Route } from 'react-router';
import history from '@/history';

const LeftRailResponsive = withResponsive(LeftRail, {
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
class PhoneTabRouterViewComponent extends Component<PhoneTabViewProps> {
  componentDidMount() {
    if (!this.props.hasSawDialPad) {
      this.props.setShowDialPad();
      const ts = container.get<TelephonyService>(TELEPHONY_SERVICE);
      ts.maximize();
    }
    const { match, currentTab } = this.props;
    if (!isValidTab(match.url)) {
      history.replace(currentTab || kDefaultPhoneTabPath);
    }
  }
  render() {
    const { match } = this.props;
    return (
      <JuiResponsiveLayout data-test-automation-id="phone-tab">
        <LeftRailResponsive current={match.url} />
        <SwitchResponsive>
          {TelephonyTabs.map(({ path, component: Comp }) => (
            <Route path={path} key={path} render={() => <Comp />} />
          ))}
        </SwitchResponsive>
      </JuiResponsiveLayout>
    );
  }
}

const PhoneTabRouterView = withRouter(PhoneTabRouterViewComponent);

export { PhoneTabRouterView };
