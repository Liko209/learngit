/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { MuteViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = MuteViewProps & WithNamespaces;

@observer
class MuteViewComponent extends Component<Props> {
  private _handleMute = async () => {
    const { muteOrUnmute } = this.props;
    muteOrUnmute();
  }

  render() {
    const { t, isMute } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          disableToolTip={true}
          onClick={this._handleMute}
          size="xxlarge"
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

const MuteView = translate('translations')(MuteViewComponent);

export { MuteView };
