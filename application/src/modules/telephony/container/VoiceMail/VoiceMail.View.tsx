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

type Props = VoiceMailViewProps & WithTranslation;

@observer
class VoiceMailViewComponent extends Component<Props> {
  private _handleVoiceMail = async () => {
    const { ignore } = this.props;
    ignore();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiFabButton
        color="semantic.negative"
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="hand_up"
        tooltipTitle={t('telephony.sendToVoicemail')}
        aria-label={t('telephony.sendToVoicemail')}
        onClick={this._handleVoiceMail}
      />
    );
  }
}

const VoiceMailView = withTranslation('translations')(VoiceMailViewComponent);

export { VoiceMailView };
