/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { MessageProps, MessageViewProps } from './types';
import { goToConversationWithLoading } from '@/common/goToConversation';

type Props = MessageProps & MessageViewProps;

class MessageView extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onClickMessage = async () => {
    const { id, afterClick } = this.props;
    const result = await goToConversationWithLoading({ id });
    if (result) {
      afterClick && afterClick();
    }
  }

  render() {
    const { render } = this.props;
    return <span onClick={this.onClickMessage}>{render()}</span>;
  }
}

export { MessageView };
