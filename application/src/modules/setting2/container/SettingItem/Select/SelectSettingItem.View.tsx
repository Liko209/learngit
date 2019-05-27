/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-10 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiBoxSelect } from 'jui/components/Selects';
import { JuiMenuItem } from 'jui/components/Menus';
import { SelectSettingItemViewProps, SelectSettingItemProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';

type BaseItemType = {
  id: number;
};

@observer
class SelectSettingItemView<T extends BaseItemType> extends Component<
  SelectSettingItemViewProps<T> & SelectSettingItemProps
> {
  handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {};

  render() {
    const { id, automationKey, settingItem, settingItemEntity } = this.props;
    const { source, value } = settingItemEntity;

    if (!source) return null;

    return (
      <JuiSettingSectionItem
        id={id}
        automationId={automationKey}
        label={settingItem.title}
        description={settingItem.description}
      >
        <JuiBoxSelect
          onChange={this.handleOnChange}
          value={value.id}
          automationId={'SettingSelectBox'}
        >
          {source.map((item: T) => this._renderSourceItem(item))}
        </JuiBoxSelect>
      </JuiSettingSectionItem>
    );
  }

  private _renderSourceItem(sourceItem: T) {
    const { sourceRenderer: SourceItemComponent } = this.props.settingItem;

    if (SourceItemComponent) {
      return <SourceItemComponent key={sourceItem.id} value={sourceItem} />;
    }

    return (
      <JuiMenuItem
        value={sourceItem.id}
        key={sourceItem.id}
        automationId={'SettingSelectItem'}
      >
        {sourceItem}
      </JuiMenuItem>
    );
  }
}
export { SelectSettingItemView };
