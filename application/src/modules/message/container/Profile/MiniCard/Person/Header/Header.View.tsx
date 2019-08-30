/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardPersonHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar/Avatar';
import { Presence } from '@/containers/Presence';
import { Emoji } from 'emoji-mart';
import { backgroundImageFn } from 'jui/pattern/Emoji';
import {
  JuiProfileMiniCardHeader,
  JuiProfileMiniCardHeaderLeft,
  JuiProfileMiniCardHeaderMiddle,
  JuiProfileMiniCardHeaderRight,
  JuiProfileMiniCardPersonName,
  JuiProfileMiniCardPersonStatus,
  JuiProfileMiniCardPersonTitle,
} from 'jui/pattern/Profile/MiniCard';
import { Favorite } from '@/containers/common/Favorite';

@observer
class ProfileMiniCardPersonHeaderView extends Component<
  ProfileMiniCardPersonHeaderViewProps
> {
  render() {
    const { id, person, colonsEmoji, statusPlainText } = this.props;
    const { userDisplayName, jobTitle } = person;
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
            <Emoji
              emoji={colonsEmoji || ''}
              set="emojione"
              size={16}
              backgroundImageFn={backgroundImageFn}
            />
            {statusPlainText}
          </JuiProfileMiniCardPersonStatus>
          <JuiProfileMiniCardPersonTitle data-test-automation-id="profileMiniCardPersonTitle">
            {jobTitle}
          </JuiProfileMiniCardPersonTitle>
        </JuiProfileMiniCardHeaderMiddle>
        <JuiProfileMiniCardHeaderRight>
          <Favorite
            id={id}
            size="small"
            dataTrackingProps={{
              source: 'miniProfile',
              conversationType: '1:1 conversation',
            }}
          />
        </JuiProfileMiniCardHeaderRight>
      </JuiProfileMiniCardHeader>
    );
  }
}

export { ProfileMiniCardPersonHeaderView };
