/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 13:54:08
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiUmi } from 'jui/components';
import { PhoneUMIViewProps, PhoneUMIProps, PhoneUMIType } from './types';

@observer
class PhoneUMIView extends Component<PhoneUMIProps & PhoneUMIViewProps> {
  render() {
    const {
      isDefaultPhoneApp,
      unreadCount,
      voicemailUMI,
      missedCallUMI,
      type = PhoneUMIType.ALL,
    } = this.props;

    if (!isDefaultPhoneApp) {
      return null;
    }

    let count = unreadCount;
    if (type === PhoneUMIType.VOICEMAIL) {
      count = voicemailUMI;
    } else if (type === PhoneUMIType.MISSEDCALL) {
      count = missedCallUMI;
    }
    return <JuiUmi variant='count' important unreadCount={count} />;
  }
}

export { PhoneUMIView };
