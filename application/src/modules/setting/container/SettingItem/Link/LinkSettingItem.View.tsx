/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-10 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiButton } from 'jui/components/Buttons/Button';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { catchError } from '@/common/catchError';
import { dataTrackingForSetting } from '../utils/dataTrackingForSetting';
import { LinkSettingItemViewProps, LinkSettingItemProps } from './types';

type Props = LinkSettingItemViewProps & LinkSettingItemProps & WithTranslation;

@observer
class LinkSettingItemViewComponent extends Component<Props> {
  @observable
  private _loading = false;

  @action
  private _handleClick = async () => {
    this._loading = true;
    const url = await this._getUrl();
    this._loading = false;
    url && window.open(url);
    const { dataTracking } = this.props.settingItem;
    dataTracking && dataTrackingForSetting(dataTracking);
  }

  @catchError.flash({
    network: 'setting.errorText.forLink',
    server: 'setting.errorText.forLink',
  })
  private _getUrl = () => {
    return this.props.getUrl();
  }

  render() {
    const { t, id, disabled, settingItem } = this.props;

    return (
      <JuiSettingSectionItem
        id={id}
        disabled={disabled}
        automationId={settingItem.automationId}
        label={t(settingItem.title || '')}
        description={t(settingItem.description || '')}
      >
        <JuiButton
          color="primary"
          disabled={disabled}
          data-test-automation-id={`settingItemButton-${
            settingItem.automationId
          }`}
          onClick={this._handleClick}
          loading={this._loading}
        >
          {t('setting.update')}
        </JuiButton>
      </JuiSettingSectionItem>
    );
  }
}

const LinkSettingItemView = withTranslation('translations')(
  LinkSettingItemViewComponent,
);
export { LinkSettingItemView };
