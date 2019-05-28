/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-10 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { JuiBoxSelect } from 'jui/components/Selects';
import { JuiMenuItem } from 'jui/components/Menus';
import { SelectSettingItemViewProps, SelectSettingItemProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { catchError } from '@/common/catchError';

type BaseItemType = {
  id: number;
};
type Props<T> = SelectSettingItemViewProps<T> &
  SelectSettingItemProps &
  WithTranslation;

@observer
class SelectSettingItemViewComponent<T extends BaseItemType> extends Component<
  Props<T>
> {
  @catchError.flash({
    // TODO move the keys out of setting.phone
    network: 'setting.phone.general.callerID.errorText',
    server: 'setting.phone.general.callerID.errorText',
  })
  private _handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await this.props.saveSetting(event.target.value);
  }

  render() {
    const { t, id, automationKey, settingItem, settingItemEntity } = this.props;

    return (
      <JuiSettingSectionItem
        id={id}
        automationId={automationKey}
        label={t(settingItem.title || '')}
        description={t(settingItem.description || '')}
      >
        {
          <JuiBoxSelect
            onChange={this._handleChange}
            value={settingItemEntity.value ? settingItemEntity.value.id : ''}
            automationId={'SettingSelectBox'}
          >
            {this._renderSource()}
          </JuiBoxSelect>
        }
      </JuiSettingSectionItem>
    );
  }

  private _renderSource() {
    const { source } = this.props.settingItemEntity;
    return source ? source.map((item: T) => this._renderSourceItem(item)) : [];
  }

  private _renderSourceItem(sourceItem: T) {
    const { sourceRenderer: ItemComponent } = this.props.settingItem;

    let node: React.ReactNode;
    if (ItemComponent) {
      node = <ItemComponent key={sourceItem.id} value={sourceItem} />;
    } else if (
      typeof sourceItem === 'string' ||
      typeof sourceItem === 'number'
    ) {
      node = sourceItem;
    } else {
      node = JSON.stringify(sourceItem);
    }

    return (
      <JuiMenuItem
        value={sourceItem.id}
        key={sourceItem.id}
        automationId={'SettingSelectItem'}
      >
        {node}
      </JuiMenuItem>
    );
  }
}

const SelectSettingItemView = withTranslation('translations')(
  SelectSettingItemViewComponent,
);
export { SelectSettingItemView };
