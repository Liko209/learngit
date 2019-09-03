/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { VoiceMailViewProps } from './types';
import { StyledActionText, JuiTransferAction } from 'jui/pattern/Dialer';
import { JuiFabButton, JuiIconButton } from 'jui/components/Buttons';

type Props = VoiceMailViewProps & WithTranslation;

@observer
class VoiceMailViewComponent extends Component<Props> {
  private _handleVoiceMail = () => {
    const { sendToVoiceMail } = this.props;
    sendToVoiceMail();
  };

  render() {
    const { t, isTransferPage, transferNumber, isIncomingCall } = this.props;
    return isTransferPage && !isIncomingCall ? (
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
        <span className={!transferNumber ? 'disabled' : undefined}>
          {t('telephony.action.toVoiceMail')}
        </span>
      </JuiTransferAction>
    ) : (
      <>
        <JuiFabButton
          color="semantic.negative"
          size="mediumLarge"
          showShadow={false}
          tooltipPlacement="top"
          iconName="voicemail"
          aria-label={t('telephony.sendToVoicemail')}
          onClick={this._handleVoiceMail}
          data-test-automation-id="telephony-voice-mail-btn"
        />
        <StyledActionText>{t('telephony.action.voicemail')}</StyledActionText>
      </>
    );
  }
}

const VoiceMailView = withTranslation('translations')(VoiceMailViewComponent);

export { VoiceMailView };
