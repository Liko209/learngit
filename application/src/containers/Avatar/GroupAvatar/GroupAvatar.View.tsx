/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { GroupAvatarViewProps } from './types';
import { JuiAvatar } from 'jui/components/Avatar';

class GroupAvatarView extends Component<GroupAvatarViewProps> {
  render() {
    const { src } = this.props;
    return <JuiAvatar src={src} />;
  }
}

export { GroupAvatarView };
