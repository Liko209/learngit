/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:23:23
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import history from '@/history';
import { observer } from 'mobx-react';
import { ViewProps } from './types';

@observer
class JumpToConversationView extends React.Component<ViewProps> {
  jumpToConversation = (id: number) => async () => {
    const { onSuccess, getConversationId } = this.props;
    const conversationId = await getConversationId(id);
    history.push(`/messages/${conversationId}`);

    onSuccess && onSuccess();
  }

  render() {
    const { id, children } = this.props;
    const renderedChildren = children({
      jumpToConversation: this.jumpToConversation,
    });
    return (
      <div style={{ cursor: 'pointer' }} onClick={this.jumpToConversation(id)}>
        {renderedChildren && React.Children.only(renderedChildren)}
      </div>
    );
  }
}

export { JumpToConversationView };
