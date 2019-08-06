/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiListItemAvatar, JuiListItemText } from 'jui/components/Lists';
import { JuiContactInfo } from 'jui/pattern/Phone/ContactInfo';
import { Avatar } from '@/containers/Avatar';
import { Profile, PROFILE_TYPE } from '@/modules/message/container/Profile';
import { MiniCard } from '@/modules/message/container/MiniCard';
import { analyticsCollector } from '@/AnalyticsCollector';
import { ANALYTICS_KEY } from '../constants';
import { ContactInfoViewProps } from './types';

@observer
class ContactInfoView extends Component<ContactInfoViewProps> {
  openMiniProfile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { personId, didOpenMiniProfile, disableOpenMiniProfile } = this.props;
    if (disableOpenMiniProfile) {
      return;
    }
    event.stopPropagation();
    if (!personId) {
      return;
    }

    analyticsCollector.openMiniProfile(ANALYTICS_KEY.VOICEMAIL_HISTORY);

    MiniCard.show(<Profile id={personId} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor: event.target as HTMLElement,
    });

    didOpenMiniProfile && didOpenMiniProfile(personId);
  };

  private _avatar() {
    const { isUnknownCaller, personId, displayName } = this.props;

    if (isUnknownCaller || (!personId && !displayName)) {
      return <Avatar showDefaultAvatar />;
    }

    return (
      <Avatar
        onClick={this.openMiniProfile}
        displayName={displayName}
        uid={personId}
      />
    );
  }

  render() {
    const { displayName, displayNumber, isUnread } = this.props;

    return (
      <JuiContactInfo isUnread={isUnread}>
        <JuiListItemAvatar>{this._avatar()}</JuiListItemAvatar>
        <JuiListItemText primary={displayName} secondary={displayNumber} />
      </JuiContactInfo>
    );
  }
}

export { ContactInfoView };
