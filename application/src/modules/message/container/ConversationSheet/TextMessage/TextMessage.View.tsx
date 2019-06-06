/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import { TextMessageViewProps } from './types';
import {
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';
@observer
class TextMessageView extends React.Component<TextMessageViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;

  render() {
    return (
      <JuiConversationPostText data-name="text">
        {this.props.getContent(this.context.keyword)}
      </JuiConversationPostText>
    );
  }
}

export { TextMessageView };
