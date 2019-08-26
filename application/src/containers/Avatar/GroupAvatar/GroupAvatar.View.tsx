/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { GroupAvatarViewProps } from './types';
import { JuiAvatar } from 'jui/components/Avatar';
import { observer } from 'mobx-react';

@observer
class GroupAvatarView extends Component<GroupAvatarViewProps> {
  render() {
    const { icon, size, onClick, ...rest } = this.props;
    return (
      <JuiAvatar onClick={onClick} iconSymbol={icon} size={size} {...rest} />
    );
  }
}

export { GroupAvatarView };
