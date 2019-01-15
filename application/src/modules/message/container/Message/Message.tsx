/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, withRouter } from 'react-router-dom';

import { MessageRouter } from './MessageRouter';
import { MessageViewProps } from './types';

@observer
class MessageComponent extends Component<MessageViewProps> {
  render() {
    return (
      <Route
        path={`${this.props.match.path}/:subPath?`}
        component={MessageRouter}
      />
    );
  }
}

const Message = withRouter(MessageComponent);

export { Message };
