/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-09 09:53:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { ViewProps } from './types';

import { GroupAvatar } from '../../Avatar/GroupAvatar';

class GroupSearchItemView extends React.Component<ViewProps> {
  render() {
    const { group, isHighlighted, id, ...rest } = this.props;
    return (
      <JuiMenuItem
        {...rest}
        selected={isHighlighted}
        avatar={<GroupAvatar cid={id} />}
      >
        <JuiListItemText primary={group.displayName} />
      </JuiMenuItem>
    );
  }
}

export { GroupSearchItemView };
