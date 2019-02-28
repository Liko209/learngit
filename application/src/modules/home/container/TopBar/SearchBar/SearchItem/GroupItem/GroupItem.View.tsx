/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { GroupAvatar } from '@/containers/Avatar';
import { JuiButton, JuiIconButton } from 'jui/components/Buttons';
import { HotKeys } from 'jui/hoc/HotKeys';
import { ViewProps } from './types';

@observer
class GroupItemComponent extends React.Component<
  ViewProps & WithNamespaces,
  {}
> {
  onEnter = async (e: KeyboardEvent) => {
    const { hovered, canJoinTeam } = this.props;
    if (!hovered) {
      return;
    }

    if (canJoinTeam) {
      await this.handleJoinTeam(e);
    } else {
      await this.goToConversation();
    }
  }

  handleJoinTeam = async (e: React.MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const { handleJoinTeam, group } = this.props;
    await handleJoinTeam(group);
  }

  goToConversation = async () => {
    const { goToConversation, group } = this.props;
    await goToConversation(group.id);
  }
  handleGoToConversation = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    this.goToConversation();
  }
  render() {
    const {
      t,
      title,
      terms,
      group,
      sectionIndex,
      cellIndex,
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
        {'messages'}
      </JuiIconButton>
    );
    return (
      <HotKeys
        keyMap={{
          enter: this.onEnter,
        }}
      >
        <JuiSearchItem
          onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
          onMouseLeave={onMouseLeave}
          hovered={hovered}
          onClick={canJoinTeam ? this.handleJoinTeam : this.goToConversation}
          Avatar={<GroupAvatar cid={id} size="small" />}
          value={displayName}
          terms={terms}
          data-test-automation-id={`search-${title}-item`}
          Actions={canJoinTeam ? joinTeamBtn : goToConversationIcon}
          isPrivate={isPrivate}
          isJoined={isJoined}
        />
      </HotKeys>
    );
  }
}

const GroupItemView = translate('translations')(GroupItemComponent);

export { GroupItemView };
