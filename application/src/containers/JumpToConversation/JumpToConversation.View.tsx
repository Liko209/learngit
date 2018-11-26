/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:23:23
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { ViewProps } from './types';

@observer
class JumpToConversationView extends React.Component<ViewProps> {
  componentDidMount() {
    const { getConversationId } = this.props;
    getConversationId();
  }
  render() {
    const { conversationId, children } = this.props;
    return (
      <Link to={`/messages/${conversationId}`}>{children && children}</Link>
    );
  }
}

export { JumpToConversationView };
