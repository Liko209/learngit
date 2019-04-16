/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPageMember } from 'jui/pattern/ConversationPageMember';
import { MemberViewProps } from './types';
import { OpenProfile } from '@/common/OpenProfile';
import i18next from 'i18next';

@observer
class MemberView extends React.Component<MemberViewProps> {
  openProfile = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    OpenProfile.show(this.props.groupId);
  }

  render() {
    const { membersCount, showMembersCount } = this.props;

    if (!showMembersCount) return null;

    return (
      <JuiConversationPageMember
        ariaLabel={i18next.t('people.team.Members')}
        title={i18next.t('people.team.Members')}
        onClick={this.openProfile}
      >
        <span>{membersCount || ''}</span>
      </JuiConversationPageMember>
    );
  }
}

export { MemberView };
