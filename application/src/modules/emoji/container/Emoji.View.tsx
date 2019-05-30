/*
 * @Author: ken.li
 * @Date: 2019-04-29 17:12:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { EmojiViewProps, EmojiProps } from './types';
import { JuiEmoji } from 'jui/pattern/Emoji';
import { i18nP } from '@/utils/i18nT';

type Types = EmojiViewProps & EmojiProps;
@observer
class EmojiView extends Component<Types> {
  handleKeepOpenChange = () => {
    this.props.setEmojiOpenStatus();
  }
  render() {
    const {
      handleEmojiClick,
      set,
      sheetSize,
      title,
      emojiOpenStatus,
    } = this.props;
    return (
      <JuiEmoji
        set={set}
        sheetSize={sheetSize}
        title={title}
        handlerIcon="emoji"
        handleEmojiClick={handleEmojiClick}
        handleKeepOpenChange={this.handleKeepOpenChange}
        isKeepOpen={emojiOpenStatus}
        toggleButtonLabel={i18nP('message.emoji.toggleButtonLabel') as string}
      />
    );
  }
}

export { EmojiView };
