/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 14:51:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { ViewProps } from './types';

import { Avatar } from '@/containers/Avatar';
import { observer } from 'mobx-react';

@observer
class ContactSearchItemView extends React.Component<ViewProps> {
  render() {
    const {
      person,
      isHighlighted,
      avatar,
      itemId,
      showEmail = true,
      ...rest
    } = this.props;
    return (
      <JuiMenuItem
        {...rest}
        selected={isHighlighted}
        avatar={avatar || <Avatar uid={itemId} />}
      >
        <JuiListItemText
          primary={person.userDisplayName}
          secondary={showEmail && person.email}
        />
      </JuiMenuItem>
    );
  }
}

export { ContactSearchItemView };
