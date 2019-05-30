/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-10 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiBoxSelect } from 'jui/components/Selects';
import { JuiMenuItem } from 'jui/components/Menus';
import { SettingItemProps } from '../SettingItemBuild';

type BaseItemType = {
  id: number;
};

type BaseComponentType<T> = {
  automationKey?: string;
  sourceItemRenderer: (sourceItem: T) => React.ReactNode;
};

class SelectsView<T extends BaseItemType> extends Component<
  SettingItemProps<T> & BaseComponentType<T>
> {
  static defaultProps = {
    source: [],
  };

  handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    const { onChange, source = [] } = this.props;
    let item;
    source.some((sourceItem: T) => {
      if (sourceItem.id === Number(value)) {
        item = sourceItem;
        return true;
      }
      return false;
    });
    item && onChange(item);
  }

  render() {
    const { source, value, sourceItemRenderer } = this.props;
    const valueId = value && value.id;
    return (
      <JuiBoxSelect
        onChange={this.handleOnChange}
        value={valueId}
        isFullWidth={true}
        automationId={'SettingSelectBox'}
      >
        {source.map((item: T) => (
          <JuiMenuItem
            value={item.id}
            key={item.id}
            automationId={'SettingSelectItem'}
          >
            {sourceItemRenderer(item)}
          </JuiMenuItem>
        ))}
      </JuiBoxSelect>
    );
  }
}
export { SelectsView };
