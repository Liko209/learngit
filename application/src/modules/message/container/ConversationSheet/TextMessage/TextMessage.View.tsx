/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import { TextMessageViewProps } from './types';

@observer
class TextMessageView extends React.Component<TextMessageViewProps> {
  render() {
    return <JuiConversationPostText data-name='text'>{this.props.renderText}</JuiConversationPostText>;
  }
}

export { TextMessageView };
