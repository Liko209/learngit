/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 16:22:22
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { Avatar } from '@/containers/Avatar';
import {
  JuiTaskAvatarName,
  JuiAvatarName,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';

class TaskAvatarName extends React.Component<Props> {
  private get _avatarName() {
    const { ids } = this.props;
    return ids.map(id => (
      <JuiAvatarName
        key={id}
        avatar={<Avatar uid={id} />}
        name={this.props.getName(id)}
      />
    ));
  }
  render() {
    return <JuiTaskAvatarName avatarNames={this._avatarName} />;
  }
}

export { TaskAvatarName };
