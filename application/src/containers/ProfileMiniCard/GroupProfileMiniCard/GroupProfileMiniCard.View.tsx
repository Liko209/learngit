/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { GroupProfileMiniCardViewProps } from './types';

class GroupProfileMiniCardView extends Component<
  GroupProfileMiniCardViewProps
> {
  render() {
    const { id, name } = this.props;
    return (
      <div>
        groupId: {id}, groupName: {name}
      </div>
    );
  }
}

export { GroupProfileMiniCardView };
