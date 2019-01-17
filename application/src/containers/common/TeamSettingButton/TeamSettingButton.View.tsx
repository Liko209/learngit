/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { TeamSettingButtonViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { toTitleCase } from '@/utils/string';
import portalManager from '@/common/PortalManager';
import { TeamSettings } from '@/containers/TeamSettings';

type Props = TeamSettingButtonViewProps & WithNamespaces;

class TeamSettingButtonViewComponent extends Component<Props> {
  onClickSettingButton = async () => {
    const { id } = this.props;
    portalManager.dismiss();
    TeamSettings.show(undefined, { id });
  }

  render() {
    const { size, t } = this.props;
    return (
      <JuiIconButton
        size={size}
        color="grey.500"
        data-test-automation-id="settingButton"
        alwaysEnableTooltip={true}
        onClick={this.onClickSettingButton}
        tooltipTitle={toTitleCase(t('setting_plural'))}
      >
        settings
      </JuiIconButton>
    );
  }
}

const TeamSettingButtonView = translate('translations')(
  TeamSettingButtonViewComponent,
);

export { TeamSettingButtonView };
