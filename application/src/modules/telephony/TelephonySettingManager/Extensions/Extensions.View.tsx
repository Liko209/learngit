/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiButton } from 'jui/components/Buttons';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ExtensionsViewProps } from './types';

@observer
class ExtensionsViewComponent extends Component<
  WithTranslation & ExtensionsViewProps
> {
  render() {
    const { t, generateWebSettingUri, isLoading } = this.props;
    return (
      <JuiButton
        color="primary"
        data-test-automation-id={'settingPhoneGeneralExtensionSetting'}
        onClick={generateWebSettingUri}
        loading={isLoading}
      >
        {t('setting.update')}
      </JuiButton>
    );
  }
}
const ExtensionsView = withTranslation('translations')(ExtensionsViewComponent);
export { ExtensionsView };
