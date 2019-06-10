/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiListItemAvatar, JuiListItemText } from 'jui/components/Lists';
import { ContactItem } from 'jui/pattern/ContactInfo';
import { Avatar } from '@/containers/Avatar';
import { Profile, PROFILE_TYPE } from '@/modules/message/container/Profile';
import { MiniCard } from '@/modules/message/container/MiniCard';
import { Person } from 'sdk/module/person/entity';
import { analyticsCollector } from '@/AnalyticsCollector';
import { ANALYTICS_KEY } from '../constants';
import { ContactInfoViewProps } from './types';

type ContactInfoProps = ContactInfoViewProps & WithTranslation;
type State = {
  person: Person | null;
};

@observer
class ContactInfoViewComponent extends Component<ContactInfoProps, State> {
  openMiniProfile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { personId, didOpenMiniProfile } = this.props;
    event.stopPropagation();
    if (!personId) {
      return;
    }

    analyticsCollector.openMiniProfile(ANALYTICS_KEY.VOICEMAIL_HISTORY);

    MiniCard.show(<Profile id={personId} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor: event.target as HTMLElement,
    });

    didOpenMiniProfile && didOpenMiniProfile(personId);
  }

  private _avatar() {
    const { isUnknownCaller, personId } = this.props;

    if (isUnknownCaller || !personId) {
      return <Avatar showDefaultAvatar={true} />;
    }

    return <Avatar onClick={this.openMiniProfile} uid={personId} />;
  }

  render() {
    const { displayName, displayNumber, isUnread } = this.props;

    return (
      <ContactItem disableButton={true} isUnread={isUnread}>
        <JuiListItemAvatar>{this._avatar()}</JuiListItemAvatar>
        <JuiListItemText primary={displayName} secondary={displayNumber} />
      </ContactItem>
    );
  }
}

const ContactInfoView = withTranslation('translations')(
  ContactInfoViewComponent,
);

export { ContactInfoView };
