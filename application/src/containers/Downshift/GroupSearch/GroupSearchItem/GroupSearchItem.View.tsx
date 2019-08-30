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
import moize from 'moize';

@observer
class GroupSearchItemView extends React.Component<ViewProps> {
  _renderAvatar = moize((id: number) => {
    return <GroupAvatar cid={id} />;
  });

  render() {
    const { group, isHighlighted, itemId, avatar, ...rest } = this.props;
    return (
      <JuiMenuItem
        {...rest}
        selected={isHighlighted}
        avatar={avatar || this._renderAvatar(itemId)}
      >
        <JuiListItemText primary={group.displayName} />
      </JuiMenuItem>
    );
  }
}

export { GroupSearchItemView };
