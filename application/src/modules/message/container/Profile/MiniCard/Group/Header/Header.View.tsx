/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardGroupHeaderViewProps } from './types';
import {
  JuiProfileMiniCardHeader,
  JuiProfileMiniCardHeaderLeft,
  JuiProfileMiniCardHeaderMiddle,
  JuiProfileMiniCardHeaderRight,
  JuiProfileMiniCardGroupName,
} from 'jui/pattern/Profile/MiniCard';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Favorite } from '@/containers/common/Favorite';
import { Privacy } from '@/containers/common/Privacy';

@observer
class ProfileMiniCardGroupHeaderView extends Component<
  ProfileMiniCardGroupHeaderViewProps
> {
  render() {
    const { id, group } = this.props;
    const { displayName, analysisType } = group;
    return (
      <JuiProfileMiniCardHeader>
        <JuiProfileMiniCardHeaderLeft>
          <GroupAvatar
            cid={id}
            size="large"
            data-test-automation-id="profileAvatar"
          />
        </JuiProfileMiniCardHeaderLeft>
        <JuiProfileMiniCardHeaderMiddle>
          <JuiProfileMiniCardGroupName data-test-automation-id="profileMiniCardGroupName">
            {displayName}
          </JuiProfileMiniCardGroupName>
        </JuiProfileMiniCardHeaderMiddle>
        <JuiProfileMiniCardHeaderRight>
          <Privacy id={id} size="small" analysisSource="miniProfile" />
          <Favorite
            id={id}
            size="small"
            dataTrackingProps={{
              source: 'miniProfile',
              conversationType: analysisType,
            }}
          />
        </JuiProfileMiniCardHeaderRight>
      </JuiProfileMiniCardHeader>
    );
  }
}

export { ProfileMiniCardGroupHeaderView };
