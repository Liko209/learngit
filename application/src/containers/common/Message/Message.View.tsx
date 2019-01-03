/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { MessageProps, MessageViewProps } from './types';
import { goToConversation } from '@/common/goToConversation';

type Props = MessageProps & MessageViewProps;

class MessageView extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onClickMessage = async () => {
    const { id, dismiss } = this.props;
    const result = await goToConversation({ id });
    if (result) {
      dismiss();
    }
  }

  render() {
    const { render } = this.props;
    return <span onClick={this.onClickMessage}>{render()}</span>;
  }
}

export { MessageView };
