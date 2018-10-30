/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { ConversationCard } from '@/containers/ConversationCard';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { StreamViewProps } from './types';

class StreamView extends PureComponent<StreamViewProps> {
  componentDidMount() {
    window.addEventListener('focus', this.focusHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.focusHandler);
  }

  componentDidUpdate(prevProps: StreamViewProps) {
    if (!prevProps.postIds.length) {
      // initial scroll to bottom when switch to new group
      this.props.setRowVisible(-1);
    }
  }

  render() {
    return (
      <JuiStream>
        <ConversationInitialPost id={this.props.groupId} />
        <div>
          {this.props.postIds.map((id: number) => (
            <ConversationCard id={id} key={id} />
          ))}
        </div>
      </JuiStream>
    );
  }
  focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }
}

export { StreamView };
