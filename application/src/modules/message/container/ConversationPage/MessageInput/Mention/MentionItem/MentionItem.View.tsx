import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { MentionItemViewProps } from './types';
import { Avatar, GroupAvatar } from '@/containers/Avatar';
import { JuiMentionPanelSectionItem } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionItem';
import { i18nP } from '@/utils/i18nT';
import { TEAM_TEXT } from '../constants';

@observer
class MentionItemView extends Component<MentionItemViewProps, {}> {
  render() {
    const { currentIndex, selectHandler, index, item, isTeam } = this.props;
    const { id } = item;
    const TEAM_SUFFIX_TEXT = i18nP('message.atMentionTeamSuffix');
    const displayName = isTeam
      ? `${TEAM_TEXT} ${TEAM_SUFFIX_TEXT}`
      : item.userDisplayName;
    const avatar = isTeam ? (
      <GroupAvatar cid={id} size="small" />
    ) : (
      <Avatar uid={id} size="small" />
    );

    return (
      <JuiMentionPanelSectionItem
        Avatar={avatar}
        displayName={displayName}
        selected={currentIndex === index}
        selectHandler={selectHandler(index)}
      />
    );
  }
}

export { MentionItemView };
