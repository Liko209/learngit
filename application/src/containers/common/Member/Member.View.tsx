/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { JuiArrowTip } from 'jui/components';
import { JuiIconography } from 'jui/foundation/Iconography';
import { JuiConversationPageMember } from 'jui/pattern/ConversationPageMember';
import { MemberViewProps } from './types';

class View extends React.Component<MemberViewProps> {
  render() {
    const { membersCount, showMembersCount, onClick } = this.props;

    if (!showMembersCount) return null;

    return (
      <JuiArrowTip
        title={i18next.t('people.team.Members')}
        aria-label={i18next.t('people.team.Members')}
      >
        <JuiConversationPageMember onClick={onClick}>
          <JuiIconography iconSize="medium">member_count</JuiIconography>
          <span>{membersCount}</span>
        </JuiConversationPageMember>
      </JuiArrowTip>
    );
  }
}

export default View;
