/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { SettingItemProps } from '@/modules/setting/container/SettingItemBuild';
import { CallerIdSettingItemViewProps } from './types';
import { JuiMenuItem } from 'jui/components/Menus/MenuItem';

type Props = SettingItemProps & CallerIdSettingItemViewProps;

@observer
class CallerIdSettingItemViewComponent extends Component<Props> {
  render() {
    const { parsedSourceItem } = this.props;

    if (!parsedSourceItem) return null;

    return (
      <JuiMenuItem
        value={parsedSourceItem.id}
        automationId={'SettingSelectItem'}
      >
        {parsedSourceItem.phoneNumber}
      </JuiMenuItem>
    );
  }
}
const CallerIdSettingItemView = CallerIdSettingItemViewComponent;
export { CallerIdSettingItemView };
