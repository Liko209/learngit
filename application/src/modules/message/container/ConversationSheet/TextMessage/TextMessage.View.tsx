/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import { TextMessageViewProps } from './types';

@observer
class TextMessageView extends React.Component<TextMessageViewProps> {
  constructor(props: TextMessageViewProps) {
    super(props);
  }

  render() {
    const { html } = this.props;
    return (
      <React.Fragment>
        <JuiConversationPostText>
          <div dangerouslySetInnerHTML={{ __html: html }} data-name="text" />
        </JuiConversationPostText>
      </React.Fragment>
    );
  }
}
export { TextMessageView };
