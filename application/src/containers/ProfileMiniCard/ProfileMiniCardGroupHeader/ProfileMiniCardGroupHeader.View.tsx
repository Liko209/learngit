/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ProfileMiniCardGroupHeaderViewProps } from './types';
import {
  JuiProfileMiniCardHeader,
  JuiProfileMiniCardHeaderLeft,
  JuiProfileMiniCardHeaderMiddle,
  JuiProfileMiniCardHeaderRight,
  JuiProfileMiniCardGroupName,
} from 'jui/pattern/ProfileMiniCard';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Favorite, Privacy } from '@/containers/common';

class ProfileMiniCardGroupHeaderView extends Component<
  ProfileMiniCardGroupHeaderViewProps
> {
  render() {
    const { id, group } = this.props;
    const { displayName, isTeam } = group;
    return (
      <JuiProfileMiniCardHeader>
        <JuiProfileMiniCardHeaderLeft>
          <GroupAvatar cid={id} size="large" />
        </JuiProfileMiniCardHeaderLeft>
        <JuiProfileMiniCardHeaderMiddle>
          <JuiProfileMiniCardGroupName>
            {displayName}
          </JuiProfileMiniCardGroupName>
        </JuiProfileMiniCardHeaderMiddle>
        <JuiProfileMiniCardHeaderRight>
          {isTeam && <Privacy id={id} />}
          <Favorite id={id} />
        </JuiProfileMiniCardHeaderRight>
      </JuiProfileMiniCardHeader>
    );
  }
}

export { ProfileMiniCardGroupHeaderView };
