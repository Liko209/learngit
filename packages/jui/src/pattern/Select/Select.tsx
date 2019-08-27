/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-16 15:58:29
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ChangeEvent } from 'react';
import { JuiBoxSelect } from '../../components/Selects';
import { JuiMenuItem } from '../../components/Menus';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiTextWithEllipsis } from '../../components/Text/TextWithEllipsis';

import { JuiText } from '../../components/Text';
import { JuiListItemSecondaryAction } from '../../components/Lists';
import { JuiVirtualizedBoxSelect } from '../../components/VirtualizedSelects';
import { extractValue } from './utils';
import { observer } from 'mobx-react';
import { computed, observable } from 'mobx';
import styled from 'styled-components';

type ItemProcessFunction<T> = (args: {
  value: T;
  source?: T[];
}) => React.ReactNode;

type SelectConfig<T> = {
  id: string | number;
  automationId?: string;
  useVirtualizedList?: boolean;
  valueExtractor?: (value: T) => string;
  valueRenderer?: ItemProcessFunction<T>;
  sourceRenderer?: ItemProcessFunction<T>;
  secondaryActionRenderer?: ItemProcessFunction<T>;
  onBeforeOpen?: () => Promise<boolean>;
};

type JuiSelectProps<T> = {
  rawValue: T;
  disabled?: boolean;
  className?: string;
  source: T[];
  config: SelectConfig<T>;
  handleChange: (newValue: string, rawValue?: T) => Promise<void> | void;
} & WithTranslation;

@observer
class JuiSelectComponent<T> extends React.Component<JuiSelectProps<T>> {
  @observable
  private _open = false;

  private _onOpen = async () => {
    const { onBeforeOpen } = this.props.config;
    this._open = onBeforeOpen ? await onBeforeOpen() : true;
  };

  private _onClose = () => {
    this._open = false;
  };

  @computed
  get value() {
    return this._extractValue(this.props.rawValue);
  }

  get automationId() {
    const { id, automationId } = this.props.config;
    return automationId || id;
  }

  private _extractValue = (sourceItem: T) => {
    const { valueExtractor } = this.props.config;
    return extractValue<T>(sourceItem, valueExtractor);
  };

  private _renderMenuItemChildren(sourceItem: T, itemValue: string) {
    const { source, config } = this.props;
    const { sourceRenderer, secondaryActionRenderer } = config;
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

  private _renderSourceItem(sourceItem: T) {
    const itemValue = this._extractValue(sourceItem);
    const { secondaryActionRenderer } = this.props.config;
    return (
      <JuiMenuItem
        hasSecondaryAction={!!secondaryActionRenderer}
        key={itemValue}
        value={itemValue}
        disabled={itemValue === ''}
        automationId={`selectBoxItem-${this.automationId}-${itemValue}`}
        data-test-automation-class={'selectBoxItem'}
        data-test-automation-value={itemValue}
      >
        {this._renderMenuItemChildren(sourceItem, itemValue)}
      </JuiMenuItem>
    );
  }

  private _renderSource() {
    return this.props.source.map((item: T) => this._renderSourceItem(item));
  }

  private _renderValue = (value: string) => {
    const { source, config } = this.props;
    const rawValue = source.find(
      sourceItem => this._extractValue(sourceItem) === value,
    );
    const renderer = config.valueRenderer || config.sourceRenderer;

    if (!renderer) {
      const type = typeof rawValue;
      if (['string', 'number'].includes(type)) {
        return <JuiText>{rawValue}</JuiText>;
      }
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

  private _handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { handleChange, source } = this.props;
    const newValue = event.target.value;
    const rawValue = source.find(
      sourceItem => this._extractValue(sourceItem) === newValue,
    );
    handleChange(newValue, rawValue);
  };

  private _renderSelect() {
    const { disabled, className } = this.props;
    return (
      <JuiBoxSelect
        onChange={this._handleChange}
        disabled={disabled}
        value={this.value}
        displayEmpty
        automationId={`selectBox-${this.automationId}`}
        data-test-automation-value={this.value}
        isFullWidth
        open={this._open}
        onOpen={this._onOpen}
        onClose={this._onClose}
        name="settings"
        renderValue={this._renderValue}
        className={className}
      >
        {this._renderSource()}
      </JuiBoxSelect>
    );
  }

  private _renderVirtualizedSelect() {
    const { config, ...rest } = this.props;
    return (
      <JuiVirtualizedBoxSelect
        onChange={this._handleChange}
        automationId={`selectBox-${this.automationId}`}
        renderValue={this._renderValue}
        name="settings"
        isFullWidth
        value={this.value}
        {...rest}
      >
        {this._renderSource()}
      </JuiVirtualizedBoxSelect>
    );
  }

  render() {
    const { config } = this.props;
    return config.useVirtualizedList
      ? this._renderVirtualizedSelect()
      : this._renderSelect();
  }
}

const JuiSelect = styled(withTranslation('translations')(JuiSelectComponent))``;
export { JuiSelect, SelectConfig };
