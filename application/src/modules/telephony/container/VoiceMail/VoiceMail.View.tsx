/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { VoiceMailViewProps } from './types';
import { JuiFabButton, JuiIconButton } from 'jui/components/Buttons';
import { JuiTransferAction } from 'jui/pattern/Dialer';

type Props = VoiceMailViewProps & WithTranslation;

@observer
class VoiceMailViewComponent extends Component<Props> {
  private _handleVoiceMail = async () => {
    const { sendToVoiceMail } = this.props;
    sendToVoiceMail();
  };

  render() {
    const { t, isTransferPage, transferNumber } = this.props;
    return isTransferPage ? (
      <JuiTransferAction>
        <JuiIconButton
          shouldPersistBg
          size="large"
          color="grey.900"
          aria-label={t('telephony.sendToVoicemail')}
          onClick={this._handleVoiceMail}
          data-test-automation-id="telephony-voice-mail-btn"
          disabled={!transferNumber}
        >
          voicemail
        </JuiIconButton>
        <span>{t('telephony.action.toVoiceMail')}</span>
      </JuiTransferAction>
    ) : (
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
