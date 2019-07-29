/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 10:23:34
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiButton } from 'jui/components/Buttons';
import { withTranslation, WithTranslation } from 'react-i18next';
import { E911SettingItemViewProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { ESettingItemState } from 'sdk/framework/model/setting';
// import { dataTrackingForSetting } from '@/modules/setting/container/SettingItem/utils/dataTrackingForSetting';

// const DATA_REACTING_CONFIG = {
//   name: 'e911Settings',
//   type: 'phoneGeneral',
// };

type Props = WithTranslation & E911SettingItemViewProps;
type State = {};
@observer
class E911SettingItemViewComponent extends Component<Props, State> {
  // handleClicked = async () => {
  //   dataTrackingForSetting(DATA_REACTING_CONFIG);
  // };

  render() {
    const { t, settingItemEntity, showUserE911, openE911 } = this.props;
    const { state } = settingItemEntity;
    const regionText = t('setting.phone.general.e911Setting.e911Address');

    const descriptionText = `${t(
      'setting.phone.general.e911Setting.e911AddressDesc',
    )} ${showUserE911}`;

    const disabled = state === ESettingItemState.DISABLE;

    return (
      <JuiSettingSectionItem
        id="E911Setting"
        label={regionText}
        description={descriptionText}
        disabled={disabled}
      >
        <JuiButton
          color="primary"
          onClick={openE911}
          disabled={disabled}
          data-test-automation-id="settingItemButton-e911Setting"
        >
          {t('setting.edit')}
        </JuiButton>
      </JuiSettingSectionItem>
    );
  }
}

const E911SettingItemView = withTranslation('translations')(
  E911SettingItemViewComponent,
);

export { E911SettingItemView };
