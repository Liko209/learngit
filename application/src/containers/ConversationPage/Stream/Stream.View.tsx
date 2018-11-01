/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ConversationCard } from '@/containers/ConversationCard';
import { toTitleCase } from '@/utils';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { JumpToFirstUnreadButton } from './JumpToUnreadButton';
import { StreamViewProps, StreamItem, StreamItemType } from './types';

type Props = WithNamespaces & StreamViewProps;

class StreamViewComponent extends Component<Props> {
  componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.postIds.length) {
      // initial scroll to bottom when switch to new group
      this.props.setRowVisible(-1);
    }
  }

  private _renderStreamItem(streamItem: StreamItem) {
    const { t } = this.props;

    switch (streamItem.type) {
      case StreamItemType.POST:
        return (
          <ConversationCard id={streamItem.value} key={streamItem.value} />
        );
      case StreamItemType.NEW_MSG_SEPARATOR:
        return (
          <TimeNodeDivider
            key={streamItem.value}
            value={toTitleCase(t('newMessage_plural'))}
          />
        );
      case StreamItemType.DATE_SEPARATOR:
        return (
          <TimeNodeDivider key={streamItem.value} value={streamItem.value} />
        );
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
        <JumpToFirstUnreadButtonWrapper>
          <JumpToFirstUnreadButton
            onClick={this._jumpToFirstUnread}
            count={9}
          />
        </JumpToFirstUnreadButtonWrapper>
      </div>
    );
  }

  private _jumpToFirstUnread = () => {
    console.log('_jumpToFirstUnread');
  }

  private _focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }

  private _blurHandler = () => {
    const { enableNewMessageSeparatorHandler } = this.props;
    enableNewMessageSeparatorHandler();
  }
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
