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
import { Transfer } from '../Transfer';
import { CallCtrlPanelViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Avatar } from '@/containers/Avatar';
import { getDisplayName } from '../../helpers';
import { DialerTitleBar } from '../DialerTitleBar';
import { WarmTransferHeader } from '../WarmTransferHeader';

type Props = WithTranslation & CallCtrlPanelViewProps;

@observer
class CallCtrlViewComponent extends React.Component<Props> {
  private _Avatar = observer(() => {
    const { uid } = this.props;
    return (
      <Avatar
        uid={uid}
        showDefaultAvatar={!uid}
        imgProps={{ draggable: false }}
        size="large"
      />
    );
  });

  private callActions = [Mute, Keypad, Hold, Add, Record, CallActions];

  render() {
    const { isExt, phone, t, name, direction, isWarmTransferPage } = this.props;
    if (direction) {
      return (
        <>
          <JuiHeaderContainer>
            <DialerTitleBar />
            {isWarmTransferPage ? (
              <WarmTransferHeader />
            ) : (
              <JuiHeader
                Avatar={this._Avatar}
                name={getDisplayName(t, direction, name)}
                phone={isExt ? `${t('telephony.Ext')} ${phone}` : phone}
                showDialerInputField={false}
              />
            )}
          </JuiHeaderContainer>
          <JuiContainer
            CallAction={isWarmTransferPage ? Transfer : End}
            KeypadActions={this.callActions}
          />
        </>
      );
    }
    return null;
  }
}

export const CallCtrlPanelView = withTranslation('translations')(
  CallCtrlViewComponent,
);
