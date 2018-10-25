/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { ConversationCard } from '@/containers/ConversationCard';
import { StreamViewProps, StreamItem, StreamItemType } from './types';

// TODO replace with real component
const NewMessageSeparator = () => (
  <div style={{ textAlign: 'center' }}>New Messages</div>
);
const EmptyConversation = () => (
  <div style={{ width: '100%', height: '100%', textAlign: 'center' }}>
    New Messages
  </div>
);

class StreamView extends PureComponent<StreamViewProps> {
  componentDidUpdate(prevProps: StreamViewProps) {
    if (!prevProps.postIds.length) {
      // initial scroll to bottom when switch to new group
      this.props.setRowVisible(-1);
    }
  }

  renderStreamItem(streamItem: StreamItem) {
    switch (streamItem.type) {
      case StreamItemType.POST:
        return (
          <ConversationCard id={streamItem.value} key={streamItem.value} />
        );
      case StreamItemType.NEW_MSG_SEPARATOR:
        return <NewMessageSeparator key="newMessages" />;
      default:
        return null;
    }
  }

  render() {
    const { items } = this.props;
    return (
      <div>
        {items.length > 0 ? (
          items.map(item => this.renderStreamItem(item))
        ) : (
          <EmptyConversation />
        )}
      </div>
    );
  }
}

export { StreamView };
