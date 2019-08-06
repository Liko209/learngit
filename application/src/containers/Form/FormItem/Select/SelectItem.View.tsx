/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-06 11:14:41
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { mainLogger } from 'sdk';
import { JuiBoxSelect } from 'jui/components/Selects';
import { JuiMenuItem } from 'jui/components/Menus';
import { SelectItemViewProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiTextWithEllipsis } from 'jui/components/Text/TextWithEllipsis';
import { JuiText } from 'jui/components/Text';
import { JuiListItemSecondaryAction } from 'jui/components';
import { JuiVirtualizedBoxSelect } from 'jui/components/VirtualizedSelects';
import { FORM_ITEM_TYPE } from '../../types';

type SourceItemType =
  | {
      id: number | string;
    }
  | string
  | number;
type Props<T> = SelectItemViewProps<T> & WithTranslation;

@observer
class SelectItemViewComponent<T extends SourceItemType> extends Component<
  Props<T>
> {
  private _handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await this.props.saveValue(event.target.value);
  };
  private _renderValue = (value: string) => {
    const { source, itemConfig } = this.props;
    const rawValue = source.find(
      sourceItem => this.props.extractValue(sourceItem) === value,
    );
    const renderer = itemConfig.valueRenderer || itemConfig.sourceRenderer;

    if (!renderer) {
      mainLogger.error(
        '[SelectItemViewComponent] valueRenderer or sourceRenderer is required for _renderValue()',
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
  private _renderSelect() {
    const { value, disabled, itemConfig } = this.props;
    return (
      <JuiBoxSelect
        onChange={this._handleChange}
        disabled={disabled}
        value={value}
        displayEmpty
        automationId={`settingItemSelectBox-${itemConfig.automationId}`}
        data-test-automation-value={value}
        isFullWidth
        name="settings"
        renderValue={this._renderValue}
      >
        {this._renderSource()}
      </JuiBoxSelect>
    );
  }
  private _renderVirtualizedSelect() {
    const { itemConfig, ...rest } = this.props;
    return (
      <JuiVirtualizedBoxSelect
        onChange={this._handleChange}
        automationId={`settingItemSelectBox-${itemConfig.automationId}`}
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
    const { secondaryActionRenderer, automationId } = this.props.itemConfig;
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
    const { source, itemConfig } = this.props;
    const { sourceRenderer, secondaryActionRenderer } = itemConfig;
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
    const { t, disabled, itemConfig } = this.props;
    return (
      <JuiSettingSectionItem
        id={itemConfig.id}
        automationId={itemConfig.automationId}
        disabled={disabled}
        label={t(itemConfig.title || '')}
        description={t(itemConfig.description || '')}
      >
        {itemConfig.type === FORM_ITEM_TYPE.VIRTUALIZED_SELECT
          ? this._renderVirtualizedSelect()
          : this._renderSelect()}
      </JuiSettingSectionItem>
    );
  }
}

const SelectItemView = withTranslation('translations')(SelectItemViewComponent);
export { SelectItemView };
