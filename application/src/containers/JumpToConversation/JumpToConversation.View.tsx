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
  componentDidMount() {
    const { getConversationId } = this.props;
    getConversationId();
  }
  jumpToConversation = () => {
    const { conversationId, onSuccess } = this.props;
    history.push(`/messages/${conversationId}`);

    onSuccess && onSuccess();
  }
  render() {
    const { children } = this.props;
    return (
      <div style={{ cursor: 'pointer' }} onClick={this.jumpToConversation}>
        {children && children}
      </div>
    );
  }
}

export { JumpToConversationView };
