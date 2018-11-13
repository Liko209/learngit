/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { NotificationViewProps, ActivityData } from './types';
import { JuiNotification } from 'jui/pattern/ConversationPage/Notification';
import { Added, Change, Join } from './Team';

const members = (postId: number, activityData: ActivityData) => {
  const { new_user_id: newUserId, inviter_id: inviterId } = activityData;
  if (newUserId === inviterId) {
    return <Join id={postId} />;
  }
  return <Added id={postId} />;
};

const activityDataKeyMappingComponent = {
  members,
  set_abbreviation: Change,
};

class NotificationView extends Component<NotificationViewProps> {
  private _renderNotificationContent() {
    const { id, activityData } = this.props;
    const Component = activityDataKeyMappingComponent[activityData.key];
    const isReactElement = React.isValidElement(Component);
    return isReactElement ? <Component id={id} /> : Component(id, activityData);
  }

  render() {
    return (
      <JuiNotification>{this._renderNotificationContent()}</JuiNotification>
    );
  }
}

export { NotificationView };
