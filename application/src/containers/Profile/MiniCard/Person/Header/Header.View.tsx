/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardPersonHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import {
  JuiProfileMiniCardHeader,
  JuiProfileMiniCardHeaderLeft,
  JuiProfileMiniCardHeaderMiddle,
  JuiProfileMiniCardHeaderRight,
  JuiProfileMiniCardPersonName,
  JuiProfileMiniCardPersonStatus,
  JuiProfileMiniCardPersonTitle,
} from 'jui/pattern/Profile/MiniCard';
import { Favorite } from '@/containers/common';

@observer
class ProfileMiniCardPersonHeaderView extends Component<
  ProfileMiniCardPersonHeaderViewProps
> {
  render() {
    const { id, person } = this.props;
    const { userDisplayName, awayStatus, jobTitle } = person;
    const presence = <Presence uid={id} size="large" borderSize="large" />;
    return (
      <JuiProfileMiniCardHeader>
        <JuiProfileMiniCardHeaderLeft>
          <Avatar
            uid={id}
            size="large"
            presence={presence}
            automationId="profileAvatar"
          />
        </JuiProfileMiniCardHeaderLeft>
        <JuiProfileMiniCardHeaderMiddle>
          <JuiProfileMiniCardPersonName data-test-automation-id="profileMiniCardPersonName">
            {userDisplayName}
          </JuiProfileMiniCardPersonName>
          <JuiProfileMiniCardPersonStatus data-test-automation-id="profileMiniCardPersonState">
            {awayStatus}
          </JuiProfileMiniCardPersonStatus>
          <JuiProfileMiniCardPersonTitle data-test-automation-id="profileMiniCardPersonTitle">
            {jobTitle}
          </JuiProfileMiniCardPersonTitle>
        </JuiProfileMiniCardHeaderMiddle>
        <JuiProfileMiniCardHeaderRight>
          <Favorite id={id} size="small" />
        </JuiProfileMiniCardHeaderRight>
      </JuiProfileMiniCardHeader>
    );
  }
}

export { ProfileMiniCardPersonHeaderView };
