/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 15:31:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework/ioc';
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
import { UnregisterCallback } from 'history';

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
    const {
      match,
      updateCurrentTab,
      hasSawDialPad,
      setShowDialPad,
      currentTab,
    } = this.props;
    const initPath = isValidTab(match.url)
      ? match.url
      : isValidTab(currentTab)
      ? currentTab
      : kDefaultPhoneTabPath;
    history.replace(initPath);
    updateCurrentTab(initPath);

    if (!hasSawDialPad) {
      setShowDialPad();
      const ts = container.get<TelephonyService>(TELEPHONY_SERVICE);
      ts.maximize();
    }

    this._unListen = this.props.history.listen(location => {
      const newSelectedPath = location.pathname;
      if (isValidTab(newSelectedPath)) {
        updateCurrentTab(newSelectedPath);
      }
    });
  }

  private _unListen: UnregisterCallback;

  componentWillUnmount() {
    this._unListen();
  }

  render() {
    const { currentTab } = this.props;
    return (
      <JuiResponsiveLayout data-test-automation-id="phone-tab">
        <LeftRailResponsive current={currentTab} />
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
