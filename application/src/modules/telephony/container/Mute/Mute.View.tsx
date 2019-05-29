/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { MuteViewProps } from './types';
import { JuiIconButton, JuiFabButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = MuteViewProps & WithTranslation;

@observer
class MuteViewComponent extends Component<Props> {
  private _handleMute = (event: React.MouseEvent) => {
    event.stopPropagation();
    const { muteOrUnmute } = this.props;
    muteOrUnmute();
  }

  render() {
    const { t, isMute, type } = this.props;
    if (type === 'fab') {
      return (
        <JuiFabButton
          color="common.white"
          onClick={this._handleMute}
          size="medium"
          showShadow={false}
          tooltipPlacement="top"
          iconName={isMute ? 'mic_off' : 'mic'}
          tooltipTitle={
            isMute ? t('telephony.action.unmute') : t('telephony.action.mute')
          }
          aria-label={
            isMute ? t('telephony.action.unmute') : t('telephony.action.mute')
          }
          data-test-automation-id="telephony-mute-btn"
        />
      );
    }
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color={isMute ? 'primary.600' : 'grey.900'}
          disableToolTip={true}
          onClick={this._handleMute}
          size="xxlarge"
          aria-label={
            isMute ? t('telephony.action.unmute') : t('telephony.action.mute')
          }
          shouldPersistBg={isMute}
          data-test-automation-id="telephony-mute-btn"
        >
          {isMute ? 'mic_off' : 'mic'}
        </JuiIconButton>
        <span>
          {isMute ? t('telephony.action.unmute') : t('telephony.action.mute')}
        </span>
      </JuiKeypadAction>
    );
  }
}

const MuteView = withTranslation('translations')(MuteViewComponent);

export { MuteView };
