/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { withTranslation, WithTranslation } from 'react-i18next';
import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPageMember } from 'jui/pattern/ConversationPageMember';
import { MemberViewProps } from './types';
import { OpenProfile } from '@/common/OpenProfile';
import { analyticsCollector } from '@/AnalyticsCollector';

@observer
class Member extends React.Component<MemberViewProps & WithTranslation> {
  openProfile = () => {
    analyticsCollector.profileDialog(
      this.props.isTeam ? 'Team' : 'Group',
      'conversationHeader_memberIcon',
    );
    OpenProfile.show(this.props.groupId, null, null, {
      disableRestoreFocus: true,
    });
  };

  render() {
    const { membersCount, showMembersCount, t } = this.props;

    if (!showMembersCount) return null;

    return (
      <JuiConversationPageMember
        ariaLabel={t('people.team.Members')}
        title={t('people.team.Members')}
        onClick={this.openProfile}
        automationId="memberButton"
      >
        <span>{membersCount || ''}</span>
      </JuiConversationPageMember>
    );
  }
}

const MemberView = withTranslation('translations')(Member);

export { MemberView };
