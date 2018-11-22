/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ProfileMiniCardPersonHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import {
  JuiProfileMiniCardPersonHeader,
  JuiProfileMiniCardPersonHeaderLeft,
  JuiProfileMiniCardPersonHeaderMiddle,
  JuiProfileMiniCardPersonHeaderRight,
  JuiProfileMiniCardPersonName,
  JuiProfileMiniCardPersonStatus,
  JuiProfileMiniCardPersonTitle,
} from 'jui/pattern/ProfileMiniCard';

import { JuiIconography } from 'jui/foundation/Iconography';

class ProfileMiniCardPersonHeaderView extends Component<
  ProfileMiniCardPersonHeaderViewProps
> {
  render() {
    const { id, person } = this.props;
    const { displayName, awayStatus, title } = person;
    const presence = <Presence uid={id} size="large" borderSize="large" />;
    return (
      <JuiProfileMiniCardPersonHeader>
        <JuiProfileMiniCardPersonHeaderLeft>
          <Avatar uid={id} size="large" presence={presence} />
        </JuiProfileMiniCardPersonHeaderLeft>
        <JuiProfileMiniCardPersonHeaderMiddle>
          <JuiProfileMiniCardPersonName>
            {displayName}
          </JuiProfileMiniCardPersonName>
          <JuiProfileMiniCardPersonStatus>
            {awayStatus}
          </JuiProfileMiniCardPersonStatus>
          <JuiProfileMiniCardPersonTitle>{title}</JuiProfileMiniCardPersonTitle>
        </JuiProfileMiniCardPersonHeaderMiddle>
        <JuiProfileMiniCardPersonHeaderRight>
          <JuiIconography fontSize="small">star</JuiIconography>
        </JuiProfileMiniCardPersonHeaderRight>
      </JuiProfileMiniCardPersonHeader>
    );
  }
}

export { ProfileMiniCardPersonHeaderView };
