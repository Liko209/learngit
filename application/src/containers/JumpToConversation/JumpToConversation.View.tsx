/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:23:23
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router-dom';
import history from '@/history';
import { ViewProps } from './types';
type Props = RouteComponentProps & ViewProps;
@observer
class JumpToConversationView extends React.Component<Props> {
  componentDidMount() {
    const { getConversationId } = this.props;
    getConversationId();
  }
  jumpToConversation = () => {
    const { conversationId } = this.props;
    history.push(`/messages/${conversationId}`);
  }
  render() {
    const { children } = this.props;
    return (
      <div onClick={this.jumpToConversation}>{children && children}</div>
    );
  }
}

export { JumpToConversationView };
