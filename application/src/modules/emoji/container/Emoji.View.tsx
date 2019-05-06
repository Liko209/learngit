/*
 * @Author: ken.li
 * @Date: 2019-04-29 17:12:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { EmojiViewProps } from './types';
import { JuiEmoji } from 'jui/pattern/Emoji';

@observer
class EmojiView extends Component<EmojiViewProps> {
  render() {
    const { handleEmojiClick, spritImage, title } = this.props;
    return (
      <JuiEmoji
        spritImage={spritImage}
        title={title}
        handlerIcon="emoji"
        handleEmojiClick={handleEmojiClick}
      />
    );
  }
}

export { EmojiView };
