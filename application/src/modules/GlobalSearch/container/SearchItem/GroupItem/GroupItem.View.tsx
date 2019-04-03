/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { GroupAvatar } from '@/containers/Avatar';
import { JuiButton, JuiIconButton } from 'jui/components/Buttons';

import { ViewProps } from './types';

@observer
class GroupItemComponent extends React.Component<
  ViewProps & WithTranslation,
  {}
> {
  handleJoinTeam = async (e: React.MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    const { handleJoinTeam, group, addRecentRecord } = this.props;
    addRecentRecord();
    await handleJoinTeam(group);
  }

  goToConversation = async () => {
    const { goToConversation, group } = this.props;
    await goToConversation(group.id);
  }

  onClick = async (event: React.MouseEvent) => {
    const { canJoinTeam } = this.props;
    if (canJoinTeam) {
      return await this.handleJoinTeam(event);
    }
    return await this.handleGoToConversation(event);
  }

  handleGoToConversation = (evt: React.MouseEvent) => {
    const { addRecentRecord } = this.props;
    evt.stopPropagation();
    addRecentRecord();
    this.goToConversation();
  }

  render() {
    const {
      t,
      title,
      terms,
      group,
      onMouseEnter,
      onMouseLeave,
      canJoinTeam,
      isPrivate,
      isJoined,
      hovered,
      shouldHidden,
    } = this.props;
    const { id, displayName } = group;

    if (shouldHidden) {
      return null;
    }
    const joinTeamBtn = (
      <JuiButton
        data-test-automation-id="joinButton"
        variant="round"
        size="small"
        onClick={this.handleJoinTeam}
      >
        {t('people.team.joinButtonTitle')}
      </JuiButton>
    );
    const goToConversationIcon = (
      <JuiIconButton
        data-test-automation-id="goToConversationIcon"
        tooltipTitle={i18next.t('message.message')}
        onClick={this.handleGoToConversation}
        variant="plain"
        size="small"
      >
        messages
      </JuiIconButton>
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
        data-test-automation-id={`search-${title}-item`}
        Actions={canJoinTeam ? joinTeamBtn : goToConversationIcon}
        isPrivate={isPrivate}
        isJoined={isJoined}
      />
    );
  }
}

const GroupItemView = withTranslation('translations')(GroupItemComponent);

export { GroupItemView };
