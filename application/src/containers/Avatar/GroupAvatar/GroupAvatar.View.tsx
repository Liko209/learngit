/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { GroupAvatarViewProps } from './types';
import { JuiAvatar } from 'jui/components/Avatar';
import { observer } from 'mobx-react';
import { accelerateURL } from '@/common/accelerateURL';
@observer
class GroupAvatarView extends Component<GroupAvatarViewProps> {
  render() {
    const { src, size, onClick, ...rest } = this.props;
    return (
      <JuiAvatar
        onClick={onClick}
        src={accelerateURL(src)}
        size={size}
        {...rest}
      />
    );
  }
}

export { GroupAvatarView };
