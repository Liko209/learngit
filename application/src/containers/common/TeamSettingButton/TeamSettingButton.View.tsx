/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { TeamSettingButtonViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { toTitleCase } from '@/utils/string';
import portalManager from '@/common/PortalManager';
import { TeamSettings } from '@/containers/TeamSettings';
import { GroupSettings } from '@/containers/GroupSettings';
import { CONVERSATION_TYPES } from '@/constants';

type Props = TeamSettingButtonViewProps & WithTranslation;

class TeamSettingButtonViewComponent extends Component<Props> {
  onClickSettingButton = async () => {
    const { id, group } = this.props;
    portalManager.dismissLast();
    if (group.type === CONVERSATION_TYPES.TEAM) {
      TeamSettings.show({ id });
    } else if (group.type === CONVERSATION_TYPES.NORMAL_GROUP) {
      GroupSettings.show({ id });
    }
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
        tooltipTitle={toTitleCase(t('setting.teamSettings'))}
      >
        settings
      </JuiIconButton>
    );
  }
}

const TeamSettingButtonView = withTranslation('translations')(
  TeamSettingButtonViewComponent,
);

export { TeamSettingButtonView };
