/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:13:11
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiLeftRail } from 'jui/pattern/LeftRail/LeftRail';
import history from '@/history';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { TelephonyTabs } from './config';
import { JuiListNavItem, JuiListNavItemText } from 'jui/components/Lists';
import { LeftRailViewProps } from './types';
import { PhoneUMI } from '../PhoneUMI';

@observer
class LeftRailViewComponent extends Component<
  WithTranslation & LeftRailViewProps
> {
  private _handleClick = (path: string) => {
    history.push(path);
    this.props.updateCurrentTab(path);
  };
  render() {
    const { t } = this.props;
    return (
      <JuiLeftRail data-test-automation-id="telephony-tab">
        {TelephonyTabs.map(({ title, path, automationID, UMIType }, index) => {
          const key = `telephony-tab-${title}-${index}`;
          const selected = path === this.props.currentTab;
          return (
            <JuiListNavItem
              key={key}
              onClick={() => this._handleClick(path)}
              selected={selected}
              classes={{ selected: 'selected' }}
              data-test-automation-id={automationID}
            >
              <JuiListNavItemText>{t(title)}</JuiListNavItemText>
              {UMIType && <PhoneUMI type={UMIType} />}
            </JuiListNavItem>
          );
        })}
      </JuiLeftRail>
    );
  }
}

const LeftRailView = withTranslation('translations')(LeftRailViewComponent);

export { LeftRailView };
