/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';
import { TextMessageViewProps } from './types';
import { MiniCard } from '@/containers/MiniCard';

@observer
class TextMessageView extends React.Component<TextMessageViewProps> {
  constructor(props: TextMessageViewProps) {
    super(props);
  }

  onClick(event: React.MouseEvent) {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const className = target.getAttribute('class') || '';
    const id = Number(target.getAttribute('id'));
    if (className.indexOf('at_mention_compose') > -1 && id > 0) {
      MiniCard.showProfile({
        id,
        anchor: target,
      });
    }
  }

  render() {
    const { html } = this.props;
    return (
      <React.Fragment>
        <JuiConversationPostText onClick={this.onClick}>
          <div dangerouslySetInnerHTML={{ __html: html }} data-name="text" />
        </JuiConversationPostText>
      </React.Fragment>
    );
  }
}
export { TextMessageView };
