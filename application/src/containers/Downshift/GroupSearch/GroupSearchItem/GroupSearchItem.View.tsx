/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-09 09:53:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { ViewProps } from './types';

import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { observer } from 'mobx-react';

@observer
class GroupSearchItemView extends React.Component<ViewProps> {
  render() {
    const { group, isHighlighted, itemId, ...rest } = this.props;
    return (
      <JuiMenuItem
        {...rest}
        selected={isHighlighted}
        avatar={<GroupAvatar cid={itemId} />}
      >
        <JuiListItemText primary={group.displayName} />
      </JuiMenuItem>
    );
  }
}

export { GroupSearchItemView };
