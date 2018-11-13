/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { Avatar } from '@/containers/Avatar';
import { JuiAvatarName } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { ViewProps } from './types';

@observer
class TaskAvatarNameView extends React.Component<ViewProps> {
  render() {
    const { name, id } = this.props;

    return <JuiAvatarName key={id} avatar={<Avatar uid={id} />} name={name} />;
  }
}

export { TaskAvatarNameView };
