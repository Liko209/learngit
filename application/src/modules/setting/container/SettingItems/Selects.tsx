/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-10 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiBoxSelect } from 'jui/components/Selects';
import { JuiMenuItem } from 'jui/components/Menus';
import { SettingItemProps } from '../SettingItemBuild';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';

class SelectsView extends Component<SettingItemProps> {
  handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    const { onChange, source = [] } = this.props;
    let item;
    source.some((sourceItem: IPhoneNumberRecord) => {
      if (sourceItem.id === Number(value)) {
        item = sourceItem;
        return true;
      }
      return false;
    });
    item && onChange<IPhoneNumberRecord>(item);
  }

  render() {
    const { source = [], value } = this.props;
    return (
      <JuiBoxSelect
        onChange={this.handleOnChange}
        value={value.id}
        automationId={'SettingSelectBox'}
      >
        {source.map((item: IPhoneNumberRecord) => (
          <JuiMenuItem
            value={item.id}
            key={item.id}
            automationId={'SettingSelectItem'}
          >
            {item.phoneNumber}
          </JuiMenuItem>
        ))}
      </JuiBoxSelect>
    );
  }
}
export { SelectsView };
