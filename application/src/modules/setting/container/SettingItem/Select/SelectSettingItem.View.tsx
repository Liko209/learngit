/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-28 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { SelectSettingItemViewProps, SelectSettingItemProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { catchError } from '@/common/catchError';
import { JuiSelect } from 'jui/pattern/Select';
import { SETTING_ITEM_TYPE } from '@/interface/setting';

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
  handleChange = async (newValue: string, rawValue?: T) => {
    await this.props.saveSetting(newValue, rawValue);
  };
  render() {
    const { t, id, disabled, settingItem, value, source } = this.props;
    const config = Object.assign({}, settingItem, {
      useVirtualizedList:
        settingItem.type === SETTING_ITEM_TYPE.VIRTUALIZED_SELECT,
    });
    return (
      <JuiSettingSectionItem
        id={id}
        automationId={settingItem.automationId}
        disabled={disabled}
        label={t(settingItem.title || '')}
        description={t(settingItem.description || '')}
      >
        <JuiSelect
          rawValue={value}
          disabled={disabled}
          source={source}
          config={config}
          handleChange={this.handleChange}
        />
      </JuiSettingSectionItem>
    );
  }
}

const SelectSettingItemView = withTranslation('translations')(
  SelectSettingItemViewComponent,
);
export { SelectSettingItemView };
