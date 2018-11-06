/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observable, computed } from 'mobx';
import { translate, WithNamespaces } from 'react-i18next';
import VisibilitySensor from 'react-visibility-sensor';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { ConversationCard } from '@/containers/ConversationCard';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { toTitleCase } from '@/utils';
import { scrollToComponent } from '@/utils/reactDom';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { JumpToFirstUnreadButton } from './JumpToUnreadButton';
import { StreamViewProps, StreamItem, StreamItemType } from './types';

type Props = WithNamespaces & StreamViewProps;

class StreamViewComponent extends Component<Props> {
  private _firstUnreadCardRef: React.ReactInstance | null = null;

  @observable
  private _firstHistoryUnreadPostVisible = false;

  @computed
  private get _firstHistoryUnreadInPage() {
    if (!this.props.firstHistoryUnreadPostId) return false;
    return this.props.postIds.includes(this.props.firstHistoryUnreadPostId);
  }

  @computed
  private get _firstHistoryUnreadPostId() {
    const { firstHistoryUnreadPostId } = this.props;
    return firstHistoryUnreadPostId;
  }

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
      this.props.plugins.loadingMorePlugin.scrollToRow(-1);
    }
    if (prevProps.groupId !== this.props.groupId) {
      this._firstHistoryUnreadPostVisible = false;
      this._firstUnreadCardRef = null;
    }
  }

  private _renderConversationCard(streamItem: StreamItem) {
    console.log(
      'this._firstHistoryUnreadPostId: ',
      this._firstHistoryUnreadPostId,
    );
    if (streamItem.value === this.props.firstHistoryUnreadPostId) {
      // Observe first unread post visibility
      return (
        <VisibilitySensor
          key={`VisibilitySensor${streamItem.value}`}
          onChange={this._handleFirstUnreadCardVisibilityChange}
        >
          <ConversationCard
            ref={this._setFirstUnreadCardRef}
            id={streamItem.value}
            key={`VisibilitySensor${streamItem.value}`}
          />
        </VisibilitySensor>
      );
    }

    return <ConversationCard id={streamItem.value} key={streamItem.value} />;
  }

  private _renderNewMessagesDivider(streamItem: StreamItem) {
    const { t } = this.props;
    return (
      <TimeNodeDivider
        key="TimeNodeDividerNewMessagesDivider"
        value={toTitleCase(t('newMessage_plural'))}
      />
    );
  }

  private _renderDateDivider(streamItem: StreamItem) {
    return (
      <TimeNodeDivider
        key={`TimeNodeDividerDateDivider${streamItem.value}`}
        value={streamItem.value}
      />
    );
  }

  private _renderStreamItem(streamItem: StreamItem) {
    const RENDERER_MAP = {
      [StreamItemType.POST]: this._renderConversationCard,
      [StreamItemType.NEW_MSG_SEPARATOR]: this._renderNewMessagesDivider,
      [StreamItemType.DATE_SEPARATOR]: this._renderDateDivider,
    };
    const streamItemRenderer = RENDERER_MAP[streamItem.type];
    return streamItemRenderer.call(this, streamItem);
  }

  private get _initialPost() {
    const { groupId, hasMore } = this.props;
    return hasMore ? null : <ConversationInitialPost id={groupId} />;
  }

  private get _streamItems() {
    return this.props.items.map(item => this._renderStreamItem(item));
  }

  private get _jumpToFirstUnreadButton() {
    const shouldHaveJumpButton =
      this.props.hasHistoryUnread &&
      (!this._firstHistoryUnreadInPage || !this._firstHistoryUnreadPostVisible);

    return shouldHaveJumpButton ? (
      <JumpToFirstUnreadButtonWrapper>
        <JumpToFirstUnreadButton
          onClick={this._jumpToFirstUnread}
          count={this.props.historyUnreadCount}
        />
      </JumpToFirstUnreadButtonWrapper>
    ) : null;
  }

  render() {
    return (
      <JuiStream>
        {this._jumpToFirstUnreadButton}
        {this._initialPost}
        <div>{this._streamItems}</div>
      </JuiStream>
    );
  }

  private _handleFirstUnreadCardVisibilityChange = (isVisible: boolean) => {
    this._firstHistoryUnreadPostVisible = isVisible;
    if (isVisible) this.props.clearHistoryUnread();
  }

  private _jumpToFirstUnread = async () => {
    const firstUnreadPostId = await this.props.loadPostUntilFirstUnread();
    if (!firstUnreadPostId) return;

    requestAnimationFrame(() => {
      scrollToComponent(this._firstUnreadCardRef);
    });
  }

  private _focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }

  private _blurHandler = () => {
    const { enableNewMessageSeparatorHandler } = this.props;
    enableNewMessageSeparatorHandler();
  }

  private _setFirstUnreadCardRef = (card: any) => {
    if (!card) return;
    this._firstUnreadCardRef = card;
  }
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
