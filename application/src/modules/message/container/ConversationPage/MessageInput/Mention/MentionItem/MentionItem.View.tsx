import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { MentionItemViewProps } from './types';
import { Avatar } from '@/containers/Avatar';
import { JuiMentionPanelSectionItem } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionItem';

@observer
class MentionItemView extends Component<MentionItemViewProps, {}> {
  render() {
    const { currentIndex, selectHandler, index, person } = this.props;
    const { id, userDisplayName } = person;

    return (
      <JuiMentionPanelSectionItem
        Avatar={<Avatar uid={id} size="small" />}
        displayName={userDisplayName}
        selected={currentIndex === index}
        selectHandler={selectHandler(index)}
      />
    );
  }
}

export { MentionItemView };
