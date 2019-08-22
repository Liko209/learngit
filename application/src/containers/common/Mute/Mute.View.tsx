/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-20 15:05:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { MuteViewProps, MuteProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { NotificationPreferences } from '@/containers/NotificationPreferences';
import portalManager from '@/common/PortalManager';

type Props = MuteViewProps & WithTranslation & MuteProps;

@observer
class MuteViewComponent extends Component<Props> {
  onClickMute = async () => {
    portalManager.dismissLast();
    NotificationPreferences.show({ groupId: this.props.groupId });
  };

  render() {
    const { t, size, isMuted } = this.props;
    if (!isMuted) {
      return null;
    }
    return (
      <JuiIconButton
        size={size}
        className="Mute"
        alwaysEnableTooltip
        onClick={this.onClickMute}
        tooltipTitle={t('setting.conversationPreferences.entry')}
        data-test-automation-id="muted"
      >
        mute
      </JuiIconButton>
    );
  }
}

const MuteView = withTranslation('translations')(MuteViewComponent);

export { MuteView };
