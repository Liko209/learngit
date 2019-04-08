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
import { CallActions, CallActionsProps } from '../CallActions';
import { VoiceMail } from '../VoiceMail';

const More = (props: CallActionsProps) => (
  <CallActions showLabel={false} {...props} />
);

More.displayName = 'more';

const Actions = [VoiceMail, Answer, More];

type Props = IncomingViewProps & WithTranslation;

@observer
class IncomingViewComponent extends Component<Props> {
  private _Avatar = () => {
    const { uid } = this.props;
    if (uid) {
      return <Avatar uid={uid} cover={true} imgProps={{ draggable: false }} />;
    }
    return null;
  }

  render() {
    const { name, phone, t } = this.props;
    return (
      <JuiIncomingCall
        name={name ? name : t('telephony.unknownCaller')}
        phone={phone}
        Actions={Actions}
        Ignore={Ignore}
        Avatar={this._Avatar}
      />
    );
  }
}

const IncomingView = withTranslation('translations')(IncomingViewComponent);

export { IncomingView };
