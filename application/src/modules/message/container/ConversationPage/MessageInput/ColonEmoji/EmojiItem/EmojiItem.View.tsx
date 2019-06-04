/*
 * @Author: ken.li
 * @Date: 2019-06-03 21:43:20
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { EmojiItemViewProps } from './types';
import { Emoji } from 'emoji-mart';
import { JuiMentionPanelSectionItem } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionItem';

@observer
class EmojiItemView extends Component<EmojiItemViewProps, {}> {
  render() {
    const { currentIndex, selectHandler, index, id } = this.props;

    return (
      <JuiMentionPanelSectionItem
        Avatar={<Emoji emoji={id || ''} set="emojione" size={32} />}
        displayName={id || ''}
        selected={currentIndex === index}
        selectHandler={selectHandler(index)}
      />
    );
  }
}

export { EmojiItemView };
