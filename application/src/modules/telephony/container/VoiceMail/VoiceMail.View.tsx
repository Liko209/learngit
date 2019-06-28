/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { VoiceMailViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = VoiceMailViewProps & WithTranslation;

@observer
class VoiceMailViewComponent extends Component<Props> {
  private _handleVoiceMail = async () => {
    const { sendToVoiceMail } = this.props;
    sendToVoiceMail();
    this._onActionSuccess('telephony.prompt.ReplyVoiceMessageSuccess');
  }

  private _onActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  render() {
    const { t } = this.props;
    return (
      <JuiFabButton
        color="semantic.negative"
        size="midLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="voicemail"
        tooltipTitle={t('telephony.sendToVoicemail')}
        aria-label={t('telephony.sendToVoicemail')}
        onClick={this._handleVoiceMail}
        data-test-automation-id="telephony-voice-mail-btn"
      />
    );
  }
}

const VoiceMailView = withTranslation('translations')(VoiceMailViewComponent);

export { VoiceMailView };
