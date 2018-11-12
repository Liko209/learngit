/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { NotificationViewProps } from './types';
import { JuiNotification } from 'jui/pattern/ConversationPage/Notification';
import { Added, Change, Join } from './Team';

class NotificationView extends Component<NotificationViewProps> {
  private _renderNotificationContent() {
    const { id, activityData } = this.props;
    switch (activityData.key) {
      case 'set_abbreviation':
        return <Change id={id} />;
      case 'members':
        const { new_user_id: newUserId, inviter_id: inviterId } = activityData;
        if (newUserId === inviterId) {
          return <Join id={id} />;
        }
        return <Added id={id} />;
      default:
        return null;
    }
  }

  render() {
    return (
      <JuiNotification>{this._renderNotificationContent()}</JuiNotification>
    );
  }
}

export { NotificationView };
