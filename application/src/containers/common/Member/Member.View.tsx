/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiConversationPageMember } from 'jui/pattern/ConversationPageMember';
import { MemberViewProps } from './types';
import { OpenProfile } from '@/common/OpenProfile';

class MemberView extends React.Component<MemberViewProps> {
  openProfile = () => {
    OpenProfile.show(this.props.groupId);
  }

  render() {
    const { membersCount, showMembersCount } = this.props;

    if (!showMembersCount) return null;

    return (
      <JuiConversationPageMember onClick={this.openProfile}>
        <span>{membersCount}</span>
      </JuiConversationPageMember>
    );
  }
}

export { MemberView };
