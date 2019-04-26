/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { NotificationViewProps, ActivityData } from './types';
import { JuiNotification } from 'jui/pattern/ConversationPage/Notification';
import { Added, Change, Join } from './Team';

@observer
class NotificationView extends Component<NotificationViewProps> {
  private _Members(activityData: ActivityData) {
    const { new_user_id: newUserId, inviter_id: inviterId } = activityData;
    if (newUserId === inviterId) {
      return Join;
    }
    return Added;
  }

  private _getComponent() {
    const { activityData } = this.props;
    const { key } = activityData;
    const mapComponent = {
      set_abbreviation: Change,
      members: this._Members(activityData),
    };
    return mapComponent[key] || null;
  }

  private _renderNotification() {
    const { id } = this.props;
    const Component = this._getComponent();
    if (!Component) {
      return null;
    }
    return <Component id={id} />;
  }

  render() {
    const { onClick } = this.props;
    return (
      <JuiNotification onClick={onClick}>
        {this._renderNotification()}
      </JuiNotification>
    );
  }
}

export { NotificationView };
