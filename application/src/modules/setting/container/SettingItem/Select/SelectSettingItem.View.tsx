/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-28 14:56:18
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
import { computed } from 'mobx';

type SourceItemType =
  | {
      id: number | string;
    }
  | string
  | number;
type Props<T> = SelectSettingItemViewProps<T> &
  SelectSettingItemProps &
  WithTranslation;

@observer
class SelectSettingItemViewComponent<
  T extends SourceItemType
> extends Component<Props<T>> {
  @computed
  private get _source() {
    const { settingItem, settingItemEntity } = this.props;
    return settingItemEntity.source || settingItem.defaultSource || [];
  }

  @computed
  private get _value() {
    return this.props.settingItemEntity.value || '';
  }

  @catchError.flash({
    // TODO move the keys out of setting.phone
    network: 'setting.phone.general.callerID.errorText',
    server: 'setting.phone.general.callerID.errorText',
  })
  private _handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await this.props.saveSetting(event.target.value);
  }

  render() {
    const { t, id, disabled, settingItem } = this.props;
    return (
      <JuiSettingSectionItem
        id={id}
        automationId={settingItem.automationId}
        disabled={disabled}
        label={t(settingItem.title || '')}
        description={t(settingItem.description || '')}
      >
        {this._renderSelect()}
      </JuiSettingSectionItem>
    );
  }

  private _renderSelect() {
    const { disabled, settingItem } = this.props;

    return (
      <JuiBoxSelect
        onChange={this._handleChange}
        disabled={disabled}
        value={this._value}
        displayEmpty={true}
        automationId={`settingItemSelectBox-${settingItem.automationId}`}
        data-test-automation-value={this._value}
        isFullWidth={true}
      >
        {this._renderSource()}
      </JuiBoxSelect>
    );
  }

  private _renderSource() {
    return this._source.map((item: T) => this._renderSourceItem(item));
  }

  private _renderSourceItem(sourceItem: T) {
    const value = this.props.extractValue(sourceItem);
    return (
      <JuiMenuItem
        key={value}
        value={value}
        disabled={value === ''}
        automationId={`settingItemSelectBoxItem-${
          this.props.settingItem.automationId
        }-${value}`}
        data-test-automation-class={'settingItemSelectBoxItem'}
        data-test-automation-value={value}
      >
        {this._renderMenuItemChildren(sourceItem)}
      </JuiMenuItem>
    );
  }

  private _renderMenuItemChildren(sourceItem: T) {
    const { extractValue, settingItem } = this.props;
    const { sourceRenderer: ItemComponent } = settingItem;
    const key = extractValue(sourceItem);
    let node: React.ReactNode;
    if (ItemComponent) {
      node = (
        <ItemComponent key={key} value={sourceItem} source={this._source} />
      );
    } else if (
      typeof sourceItem === 'string' ||
      typeof sourceItem === 'number'
    ) {
      node = sourceItem;
    } else {
      node = key;
    }
    return node;
  }
}

const SelectSettingItemView = withTranslation('translations')(
  SelectSettingItemViewComponent,
);
export { SelectSettingItemView };
