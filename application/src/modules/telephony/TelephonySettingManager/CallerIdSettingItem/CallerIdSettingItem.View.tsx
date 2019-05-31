/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { SettingItemProps } from '@/modules/setting/container/SettingItemBuild';
import { SelectsView } from '@/modules/setting/container/SettingItems';
import { JuiText } from 'jui/components/Text';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import { CallerIdSettingItemViewModelProps } from './types';

@observer
class CallerIdSettingItemViewComponent extends Component<
  SettingItemProps & CallerIdSettingItemViewModelProps
> {
  private _renderSourceItem = (sourceItem: IPhoneNumberRecord) => {
    const parsedItem = this.props.parsedSource.find(
      item => item.id === sourceItem.id,
    );
    return <JuiText>{parsedItem!.phoneNumber}</JuiText>;
  }

  render() {
    const { parsedSource, ...rest } = this.props;
    return (
      <SelectsView
        {...rest}
        sourceItemRenderer={this._renderSourceItem}
        automationKey={'callerId'}
      />
    );
  }
}
const CallerIdSettingItemView = CallerIdSettingItemViewComponent;
export { CallerIdSettingItemView };
