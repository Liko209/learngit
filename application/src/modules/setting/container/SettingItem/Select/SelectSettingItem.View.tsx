/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-28 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { mainLogger } from 'foundation/log';
import { JuiBoxSelect } from 'jui/components/Selects';
import { JuiMenuItem } from 'jui/components/Menus';
import { SelectSettingItemViewProps, SelectSettingItemProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiTextWithEllipsis } from 'jui/components/Text/TextWithEllipsis';
import { catchError } from '@/common/catchError';
import { JuiText } from 'jui/components/Text';
import { JuiListItemSecondaryAction } from 'jui/components/Lists';
import { JuiVirtualizedBoxSelect } from 'jui/components/VirtualizedSelects';
import { SETTING_ITEM_TYPE } from '@/interface/setting';
import { observable } from 'mobx';

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
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  private _handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await this.props.saveSetting(event.target.value);
  };
  private _renderValue = (value: string) => {
    const { source, settingItem } = this.props;
    const rawValue = source.find(
      sourceItem => this.props.extractValue(sourceItem) === value,
    );
    const renderer = settingItem.valueRenderer || settingItem.sourceRenderer;

    if (!renderer) {
      const type = typeof rawValue;
      if (['string', 'number'].includes(type)) {
        return <JuiText>{rawValue}</JuiText>;
      }
      mainLogger.error(
        '[SelectSettingItemViewComponent] valueRenderer or sourceRenderer is required for _renderValue()',
      );
      return null;
    }

    if (!rawValue) {
      return null;
    }

    const reactNode = renderer({ source, value: rawValue });
    if (typeof reactNode === 'string') {
      return <JuiText>{reactNode}</JuiText>;
    }
    return reactNode;
  };

  @observable
  private _open = false;

  private _onOpen = async () => {
    const { onBeforeOpen } = this.props.settingItem;
    this._open = onBeforeOpen ? await onBeforeOpen() : true;
  };

  private _onClose = () => {
    this._open = false;
  };

  private _renderSelect() {
    const { value, disabled, settingItem } = this.props;
    return (
      <JuiBoxSelect
        onChange={this._handleChange}
        disabled={disabled}
        value={value}
        displayEmpty
        automationId={`settingItemSelectBox-${settingItem.automationId}`}
        data-test-automation-value={value}
        isFullWidth
        open={this._open}
        onOpen={this._onOpen}
        onClose={this._onClose}
        name="settings"
        renderValue={this._renderValue}
      >
        {this._renderSource()}
      </JuiBoxSelect>
    );
  }
  private _renderVirtualizedSelect() {
    const { settingItem, ...rest } = this.props;
    return (
      <JuiVirtualizedBoxSelect
        onChange={this._handleChange}
        automationId={`settingItemSelectBox-${settingItem.automationId}`}
        renderValue={this._renderValue}
        name="settings"
        isFullWidth
        {...rest}
      >
        {this._renderSource()}
      </JuiVirtualizedBoxSelect>
    );
  }
  private _renderSource() {
    return this.props.source.map((item: T) => this._renderSourceItem(item));
  }

  private _renderSourceItem(sourceItem: T) {
    const itemValue = this.props.extractValue(sourceItem);
    const { secondaryActionRenderer, automationId } = this.props.settingItem;
    return (
      <JuiMenuItem
        hasSecondaryAction={!!secondaryActionRenderer}
        key={itemValue}
        value={itemValue}
        disabled={itemValue === ''}
        automationId={`settingItemSelectBoxItem-${automationId}-${itemValue}`}
        data-test-automation-class={'settingItemSelectBoxItem'}
        data-test-automation-value={itemValue}
      >
        {this._renderMenuItemChildren(sourceItem, itemValue)}
      </JuiMenuItem>
    );
  }

  private _renderMenuItemChildren(sourceItem: T, itemValue: string) {
    const { source, settingItem } = this.props;
    const { sourceRenderer, secondaryActionRenderer } = settingItem;
    const option = sourceRenderer ? (
      sourceRenderer({ source, value: sourceItem })
    ) : (
      <JuiTextWithEllipsis>{itemValue}</JuiTextWithEllipsis>
    );
    if (!secondaryActionRenderer) {
      return option;
    }
    const secondaryAction = (
      <JuiListItemSecondaryAction>
        {secondaryActionRenderer({ source, value: sourceItem })}
      </JuiListItemSecondaryAction>
    );
    return (
      <>
        {option}
        {secondaryAction}
      </>
    );
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
        {settingItem.type === SETTING_ITEM_TYPE.VIRTUALIZED_SELECT
          ? this._renderVirtualizedSelect()
          : this._renderSelect()}
      </JuiSettingSectionItem>
    );
  }
}

const SelectSettingItemView = withTranslation('translations')(
  SelectSettingItemViewComponent,
);
export { SelectSettingItemView };
