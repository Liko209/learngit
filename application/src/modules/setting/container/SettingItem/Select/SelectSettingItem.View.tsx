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
    const { value, disabled, settingItem } = this.props;

    return (
      <JuiBoxSelect
        onChange={this._handleChange}
        disabled={disabled}
        value={value}
        displayEmpty={true}
        automationId={`settingItemSelectBox-${settingItem.automationId}`}
        data-test-automation-value={value}
        isFullWidth={true}
      >
        {this._renderSource()}
      </JuiBoxSelect>
    );
  }

  private _renderSource() {
    return this.props.source.map((item: T) => this._renderSourceItem(item));
  }

  private _renderSourceItem(sourceItem: T) {
    const itemValue = this.props.extractValue(sourceItem);
    return (
      <JuiMenuItem
        key={itemValue}
        value={itemValue}
        disabled={itemValue === ''}
        automationId={`settingItemSelectBoxItem-${
          this.props.settingItem.automationId
        }-${itemValue}`}
        data-test-automation-class={'settingItemSelectBoxItem'}
        data-test-automation-value={itemValue}
      >
        {this._renderMenuItemChildren(sourceItem, itemValue)}
      </JuiMenuItem>
    );
  }

  private _renderMenuItemChildren(sourceItem: T, itemValue: string) {
    const { source, settingItem } = this.props;
    const { sourceRenderer: ItemComponent } = settingItem;
    return ItemComponent ? (
      <ItemComponent key={itemValue} value={sourceItem} source={source} />
    ) : (
      itemValue
    );
  }
}

const SelectSettingItemView = withTranslation('translations')(
  SelectSettingItemViewComponent,
);
export { SelectSettingItemView };
