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
class AvatarNameView extends React.Component<ViewProps> {
  render() {
    const { id, person } = this.props;

    if (person.isMocked) {
      return null;
    }

    return (
      <JuiAvatarName
        key={id}
        Avatar={<Avatar uid={id} size="small" />}
        name={person.userDisplayName}
      />
    );
  }
}

export { AvatarNameView };
