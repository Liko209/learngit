/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { GroupAvatar } from '@/containers/Avatar';
import { JuiIconButton, JuiRoundButton } from 'jui/components/Buttons';

import { ViewProps } from './types';

type GroupItemProps = ViewProps & WithTranslation & { automationId?: string };

@observer
class GroupItemComponent extends React.Component<GroupItemProps> {
  handleJoinTeam = async (e: React.MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { handleJoinTeam, group, addRecentRecord } = this.props;
    addRecentRecord();
    await handleJoinTeam(group);
  };

  goToConversation = async () => {
    const { goToConversation, group } = this.props;
    await goToConversation(group.id);
  };

  onClick = async (event: React.MouseEvent) => {
    const { canJoinTeam } = this.props;
    if (canJoinTeam) {
      return await this.handleJoinTeam(event);
    }
    return await this.handleGoToConversation(event);
  };

  handleGoToConversation = (evt: React.MouseEvent) => {
    const { addRecentRecord } = this.props;
    evt.stopPropagation();
    addRecentRecord();
    this.goToConversation();
  };

  handleStartConference = (evt: React.MouseEvent) => {
    evt.stopPropagation();
  };

  private get _conversationActions() {
    const { t } = this.props;

    return (
      <>
        <JuiIconButton
          tooltipTitle={t('phone.startConference')}
          onClick={this.handleStartConference}
          variant="plain"
          size="small"
        >
          conference
        </JuiIconButton>
        <JuiIconButton
          data-test-automation-id="goToConversationIcon"
          tooltipTitle={t('message.message')}
          onClick={this.handleGoToConversation}
          variant="plain"
          size="small"
        >
          messages
        </JuiIconButton>
      </>
    );
  }

  render() {
    const {
      t,
      terms,
      group,
      onMouseEnter,
      onMouseLeave,
      canJoinTeam,
      isPrivate,
      isJoined,
      hovered,
      shouldHidden,
      automationId,
    } = this.props;
    const { id, displayName } = group;

    if (shouldHidden) {
      return null;
    }

    const joinTeamBtn = (
      <JuiRoundButton
        data-test-automation-id="joinButton"
        onClick={this.handleJoinTeam}
      >
        {t('people.team.joinButtonTitle')}
      </JuiRoundButton>
    );

    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        onClick={this.onClick}
        Avatar={<GroupAvatar cid={id} size="small" />}
        value={displayName}
        terms={terms}
        data-test-automation-id={automationId}
        Actions={canJoinTeam ? joinTeamBtn : this._conversationActions}
        isPrivate={isPrivate}
        isJoined={isJoined}
        joinedStatusText={t('people.team.joinedStatus')}
      />
    );
  }
}

const GroupItemView = withTranslation('translations')(GroupItemComponent);

export { GroupItemView };
