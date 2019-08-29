/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 17:18:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiHeaderContainer,
  JuiHeader,
  JuiContainer,
} from 'jui/pattern/Dialer';
import { End } from '../End';
import { Mute } from '../Mute';
import { Keypad } from '../Keypad';
import { Hold } from '../Hold';
import { Add } from '../Add';
import { Record } from '../Record';
import { CallActions } from '../CallActions';
import { CallCtrlPanelViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Avatar } from '@/containers/Avatar';
import { getDisplayName } from '../../helpers';
import { DialerTitleBar } from '../DialerTitleBar';
import { JuiAvatar } from 'jui/components/Avatar';
import { JuiIconography } from 'jui/foundation/Iconography';
import conference from 'jui/assets/jupiter-icon/icon-conference.svg';

type Props = WithTranslation & CallCtrlPanelViewProps;

@observer
class CallCtrlViewComponent extends React.Component<Props> {
  private _Avatar = observer(() => {
    const { uid, isConference } = this.props;
    if (isConference) {
      return (
        <JuiAvatar data-test-automation-id="dialer-header-avatar" size="large" color="white" customColor>
          <JuiIconography iconSize="large" iconColor={['primary', '600']} symbol={conference} desc="conference" />
        </JuiAvatar>
      )
    }
    return (
      <Avatar
        data-test-automation-id="dialer-header-avatar"
        uid={uid}
        showDefaultAvatar={!uid}
        imgProps={{ draggable: false }}
        size="large"
      />
    );
  });

  private callActions = [Mute, Keypad, Hold, Add, Record, CallActions];

  render() {
    const { isExt, phone, t, name, direction, isConference } = this.props;
    if (direction) {
      return (
        <>
          <JuiHeaderContainer>
            <DialerTitleBar />
            <JuiHeader
              Avatar={this._Avatar}
              name={isConference ? t('telephony.conferenceCall') : getDisplayName(t, direction, name)}
              phone={isExt ? `${t('telephony.Ext')} ${phone}` : phone}
              showDialerInputField={false}
            />
          </JuiHeaderContainer>
          <JuiContainer CallAction={End} KeypadActions={this.callActions} />
        </>
      );
    }
    return null;
  }
}

export const CallCtrlPanelView = withTranslation('translations')(
  CallCtrlViewComponent,
);
