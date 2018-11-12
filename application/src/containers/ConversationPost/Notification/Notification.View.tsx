/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { NotificationViewProps } from './types';
import { JuiNotification } from 'jui/pattern/ConversationPage/Notification';

class NotificationView extends Component<NotificationViewProps> {
  render() {
    const { content, date } = this.props;
    return <JuiNotification content={content} date={date} />;
  }
}

export { NotificationView };
