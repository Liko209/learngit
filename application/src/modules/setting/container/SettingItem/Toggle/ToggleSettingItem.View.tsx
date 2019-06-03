/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 13:30:09
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { JuiToggleButton } from 'jui/components/Buttons';
import { ToggleSettingItemViewProps, ToggleSettingItemProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { catchError } from '@/common/catchError';

type Props = ToggleSettingItemViewProps &
  ToggleSettingItemProps &
  WithTranslation;

@observer
class ToggleSettingItemViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  private _handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await this.props.saveSetting(event.target.checked);
  }

  render() {
    const { t, id, settingItem, disabled } = this.props;
    return (
      <JuiSettingSectionItem
        id={id}
        automationId={settingItem.automationId}
        disabled={disabled}
        label={t(settingItem.title || '')}
        description={t(settingItem.description || '')}
      >
        {this._renderToggle()}
      </JuiSettingSectionItem>
    );
  }

  private _renderToggle() {
    const { disabled, settingItem, settingItemEntity } = this.props;
    const value = Boolean(settingItemEntity.value);
    return (
      <JuiToggleButton
        data-test-automation-id={`settingItemToggleButton-${
          settingItem.automationId
        }`}
        data-test-automation-value={value}
        checked={value}
        disabled={disabled}
        onChange={this._handleChange}
      />
    );
  }
}
const ToggleSettingItemView = withTranslation('translations')(
  ToggleSettingItemViewComponent,
);

export { ToggleSettingItemView };
