/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import VisibilitySensor from 'react-visibility-sensor';
import { ConversationCard } from '@/containers/ConversationCard';
import { toTitleCase } from '@/utils';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { JumpToFirstUnreadButton } from './JumpToUnreadButton';
import { StreamViewProps, StreamItem, StreamItemType } from './types';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

type Props = WithNamespaces & StreamViewProps;

@observer
class StreamViewComponent extends Component<Props> {
  @observable
  private _newMessageSeparatorVisible = false;

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
          <VisibilitySensor
            onChange={this._newMessagesSeparatorVisibilityChange}
          >
            {() => (
              <TimeNodeDivider
                key={streamItem.value}
                value={toTitleCase(t('newMessage_plural'))}
              />
            )}
          </VisibilitySensor>
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
        {!this._newMessageSeparatorVisible ? (
          <JumpToFirstUnreadButtonWrapper>
            <JumpToFirstUnreadButton
              onClick={this._jumpToFirstUnread}
              count={9}
            />
          </JumpToFirstUnreadButtonWrapper>
        ) : null}
      </div>
    );
  }

  private _newMessagesSeparatorVisibilityChange = (isVisible: boolean) => {
    this._newMessageSeparatorVisible = isVisible;
    if (isVisible) this._readFirstUnread();
  }

  private _readFirstUnread = () => {
    console.log('_readFirstUnread');
  }

  private _jumpToFirstUnread = () => {
    console.log('_jumpToFirstUnread');
    this._readFirstUnread();
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
