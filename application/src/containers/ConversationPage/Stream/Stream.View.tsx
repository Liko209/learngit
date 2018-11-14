/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observable, computed, action } from 'mobx';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import VisibilitySensor from 'react-visibility-sensor';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { ConversationCard } from '@/containers/ConversationCard';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { toTitleCase } from '@/utils/string';
import { scrollToComponent } from './helper';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { StreamViewProps, StreamItem, StreamItemType } from './types';

const VISIBILITY_SENSOR_OFFSET = { top: 80 };

type Props = WithNamespaces & StreamViewProps;

@observer
class StreamViewComponent extends Component<Props> {
  private _listRef: React.RefObject<HTMLElement> = React.createRef();

  private _firstUnreadCardRef: React.ReactInstance | null = null;

  private _timeout: NodeJS.Timeout | null;

  @observable
  private _jumpToFirstUnreadLoading = false;

  @observable
  private _firstHistoryUnreadPostViewed = false;

  @computed
  private get _firstHistoryUnreadInPage() {
    if (!this.props.firstHistoryUnreadPostId) return false;
    return this.props.postIds.includes(this.props.firstHistoryUnreadPostId);
  }

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    // Scroller's on componentDidMount was called earlier than stream itself
    this.props.onListAsyncMounted(this._listRef);
    await this.props.loadInitialPosts();
    this.props.scrollToRow(-1);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.groupId !== this.props.groupId) {
      await this.props.loadInitialPosts();
      this.props.scrollToRow(-1);
    }
    if (prevProps.groupId !== this.props.groupId) {
      this._jumpToFirstUnreadLoading = false;
      this._firstHistoryUnreadPostViewed = false;
      this._firstUnreadCardRef = null;
    }
  }

  private _renderConversationCard(streamItem: StreamItem) {
    const { firstHistoryUnreadPostId, hasHistoryUnread } = this.props;
    if (
      hasHistoryUnread &&
      firstHistoryUnreadPostId &&
      streamItem.value <= firstHistoryUnreadPostId
    ) {
      // Observe all visibility of posts which are older
      // than the first unread post
      return (
        <VisibilitySensor
          key={`VisibilitySensor${streamItem.value}`}
          offset={VISIBILITY_SENSOR_OFFSET}
          onChange={this._handleFirstUnreadPostVisibilityChange}
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
    const {
      t,
      hasHistoryUnread,
      historyUnreadCount,
      historyGroupState,
    } = this.props;

    const shouldHaveJumpButton =
      hasHistoryUnread &&
      historyGroupState &&
      historyUnreadCount > 0 &&
      (!this._firstHistoryUnreadInPage || !this._firstHistoryUnreadPostViewed);

    const countText =
      historyUnreadCount > 99 ? '99+' : String(historyUnreadCount);

    return shouldHaveJumpButton ? (
      <JumpToFirstUnreadButtonWrapper>
        <JuiLozengeButton
          arrowDirection="up"
          loading={this._jumpToFirstUnreadLoading}
          onClick={this._jumpToFirstUnread}
        >
          {countText} {toTitleCase(t('newMessage_plural'))}
        </JuiLozengeButton>
      </JumpToFirstUnreadButtonWrapper>
    ) : null;
  }

  render() {
    return (
      <JuiStream>
        {this._jumpToFirstUnreadButton}
        {this._initialPost}
        <section ref={this._listRef}>
          {this._streamItems}
          {this._jumpToFirstUnreadLoading}
        </section>
      </JuiStream>
    );
  }

  @action
  private _handleFirstUnreadPostVisibilityChange = (isVisible: boolean) => {
    if (isVisible) {
      this._firstHistoryUnreadPostViewed = true;
      this.props.clearHistoryUnread();
    }
  }

  @action.bound
  private _jumpToFirstUnread = async () => {
    if (this._jumpToFirstUnreadLoading || this._timeout) return;

    // Delay 500ms then show loading
    this._timeout = setTimeout(() => {
      this._jumpToFirstUnreadLoading = true;
    },                         500);

    const firstUnreadPostId = await this.props.loadPostUntilFirstUnread();

    clearTimeout(this._timeout);
    this._timeout = null;

    this._jumpToFirstUnreadLoading = false;
    if (!firstUnreadPostId) return;

    window.requestAnimationFrame(() => {
      scrollToComponent(this._firstUnreadCardRef, {
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  private _focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
  }

  private _setFirstUnreadCardRef = (card: any) => {
    if (!card) return;
    this._firstUnreadCardRef = card;
  }
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
