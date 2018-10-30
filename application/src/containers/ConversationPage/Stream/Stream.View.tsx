/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { ConversationCard } from '@/containers/ConversationCard';
import { StreamViewProps, StreamItem, StreamItemType } from './types';
import { NewMessageSeparator } from './NewMessageSeparator';

class StreamView extends Component<StreamViewProps> {
  componentDidMount() {
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);
  }

  componentDidUpdate(prevProps: StreamViewProps) {
    if (!prevProps.postIds.length) {
      // initial scroll to bottom when switch to new group
      this.props.setRowVisible(-1);
    }
  }

  private _renderStreamItem(streamItem: StreamItem) {
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
        {items.length > 0
          ? items.map(item => this._renderStreamItem(item))
          : null}
      </div>
    );
  }
  focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }
  blurHandler = () => {
    const { enableNewMessageSeparatorHandler } = this.props;
    enableNewMessageSeparatorHandler();
  }
}

export { StreamView };
