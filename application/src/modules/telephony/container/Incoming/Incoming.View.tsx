/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Avatar } from '@/containers/Avatar';
import { IncomingViewProps } from './types';
import { JuiIncomingCall } from 'jui/pattern/Dialer';
import { Ignore } from '../Ignore';
import { Answer } from '../Answer';
import { EndAndAnswer } from '../EndAndAnswer';
import { CallActions, CallActionsProps } from '../CallActions';
import { VoiceMail } from '../VoiceMail';
import { Reply } from '../Reply';
import { Forward } from '../Forward';
import { INCOMING_STATE } from '../../store';
import { getDisplayName } from '../../helpers';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { analyticsCollector } from '@/AnalyticsCollector';

const More = (props: CallActionsProps) => (
  <CallActions showLabel={false} {...props} shouldPersistBg />
);

More.displayName = 'more';

const incomingCallActions = [Ignore, More, VoiceMail, Answer];
const multipleIncomingCallActions = [Ignore, More, EndAndAnswer, VoiceMail];

type Props = IncomingViewProps & WithTranslation;

@observer
class IncomingViewComponent extends Component<Props> {
  private _imgProps = { draggable: false };
  private _DefaultAvatar = observer(() => {
    return <Avatar cover showDefaultAvatar imgProps={{ draggable: false }} />;
  });

  private _Avatar = observer(() => {
    const { uid, name } = this.props;
    return (
      <Avatar uid={uid} displayName={name} cover imgProps={this._imgProps} />
    );
  });

  componentDidMount() {
    const { isMultipleCall } = this.props;
    const type = isMultipleCall ? 'multiCall' : 'singleCall';
    analyticsCollector.seeIncomingCallPage(type);
  }

  render() {
    const {
      name,
      phone,
      t,
      isExt,
      incomingState,
      uid,
      isMultipleCall,
    } = this.props;

    const Actions = isMultipleCall
      ? multipleIncomingCallActions
      : incomingCallActions;

    switch (incomingState) {
      case INCOMING_STATE.REPLY:
        return <Reply />;

      case INCOMING_STATE.FORWARD:
        return <Forward />;

      default:
        return (
          <JuiIncomingCall
            name={getDisplayName(t, CALL_DIRECTION.INBOUND, name)}
            phone={phone && isExt ? `${t('telephony.Ext')} ${phone}` : phone}
            Actions={Actions}
            Avatar={uid || name ? this._Avatar : this._DefaultAvatar}
          />
        );
    }
  }
}

const IncomingView = withTranslation('translations')(IncomingViewComponent);

export { IncomingView };
