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
import { JuiIconography } from 'jui/foundation/Iconography';

class ProfileMiniCardGroupHeaderView extends Component<
  ProfileMiniCardGroupHeaderViewProps
> {
  render() {
    const { id, group } = this.props;
    const { displayName, isTeam } = group;
    return (
      <JuiProfileMiniCardHeader>
        <JuiProfileMiniCardHeaderLeft>{id}</JuiProfileMiniCardHeaderLeft>
        <JuiProfileMiniCardHeaderMiddle>
          <JuiProfileMiniCardGroupName>
            {displayName}
          </JuiProfileMiniCardGroupName>
        </JuiProfileMiniCardHeaderMiddle>
        {isTeam && (
          <JuiProfileMiniCardHeaderRight>
            <JuiIconography fontSize="small">star</JuiIconography>
            <JuiIconography fontSize="small">star</JuiIconography>
          </JuiProfileMiniCardHeaderRight>
        )}
      </JuiProfileMiniCardHeader>
    );
  }
}

export { ProfileMiniCardGroupHeaderView };
