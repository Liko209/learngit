/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ConversationPost } from '@/containers/ConversationPost';
import VisibilitySensor from 'react-visibility-sensor';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { toTitleCase } from '@/utils/string';
import { scrollToComponent, nextTick, getScrollParent } from './helper';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { StreamViewProps, StreamItem, StreamItemType } from './types';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';
import { extractView } from 'jui/hoc/extractView';
import { mainLogger } from 'sdk';

const VISIBILITY_SENSOR_OFFSET = { top: 80 };
const LOADING_DELAY = 500;

type Props = WithNamespaces & StreamViewProps;
@observer
class StreamViewComponent extends Component<Props> {
  private _listRef: React.RefObject<HTMLElement> = React.createRef();
  private _postRefs: Map<number, any> = new Map();
  private _visibilitySensorEnabled = false;
  private _isAtBottom = false;
  private _isAtTop = false;
  private _timeout: NodeJS.Timeout | null;
  private _temporaryDisableAutoScroll = false;
  private _scrollHeight = 0;
  private _scrollTop = 0;
  private _ro: ResizeObserver;
  private _globalStore = storeManager.getGlobalStore();
  @observable
  private _jumpToFirstUnreadLoading = false;

  @observable
  private _firstHistoryUnreadPostViewed: boolean | null = null;
  state = {
    _jumpToPostId: 0,
  };

  static getDerivedStateFromProps(props: Props) {
    if (props.jumpToPostId) {
      return { _jumpToPostId: props.jumpToPostId };
    }
    return null;
  }
  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    await this.props.loadInitialPosts();
    if (!this._listRef.current) {
      return; // the current component is unmounted
    }
    await this.scrollToPost(
      this.state._jumpToPostId || this.props.mostRecentPostId,
    );
    this._stickToBottom();
    this._visibilitySensorEnabled = true;
    this.props.updateHistoryHandler();
    this.props.markAsRead();
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.removeEventListener('blur', this._blurHandler);
    this._ro && this._ro.disconnect();
  }

  getSnapshotBeforeUpdate() {
    this._isAtBottom = this.props.atBottom();
    this._isAtTop = this.props.atTop();
    const parentEl = getScrollParent(this._listRef.current!);
    this._scrollHeight = parentEl.scrollHeight;
    this._scrollTop = parentEl.scrollTop;
    return {};
  }

  async componentDidUpdate(prevProps: StreamViewProps) {
    const { hasMoreDown, hasMoreUp, postIds: prevPostIds } = prevProps;
    const { postIds, mostRecentPostId } = this.props;
    const prevSize = prevPostIds.length;
    const currSize = postIds.length;
    const prevLastPost = _(prevPostIds).last();
    const currentLastPost = _(postIds).last();
    if (postIds.length && mostRecentPostId) {
      if (!postIds.includes(mostRecentPostId)) {
        storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
      }
    }
    if (prevSize === 0) {
      return;
    }
    if (prevSize < currSize) {
      // scroll bottom and load post
      if (prevLastPost !== currentLastPost) {
        if (this._isAtBottom && !hasMoreDown) {
          return this.scrollToBottom();
        }
      }

      // scroll TOP and load posts
      if (this._isAtTop && hasMoreUp) {
        await nextTick();
        const parent = getScrollParent(this._listRef.current!);
        parent.scrollTop =
          this._scrollTop + parent.scrollHeight - this._scrollHeight;
        return;
      }
    }
    return;
  }

  private async _stickToBottom() {
    const win = window as any;
    let RO = win.ResizeObserver;
    if (typeof win.ResizeObserver === 'undefined') {
      RO = (await import(/* webpackMode: "eager" */
      /*  webpackChunkName: "ro" */
      'resize-observer-polyfill')).default;
    }
    const el = this._listRef.current;
    if (!el) {
      return;
    }
    this._ro = new RO(this._heightChangedHandler);
    this._ro.observe(el);
  }

  private _heightChangedHandler = (entries: any) => {
    const listEl = this._listRef.current;
    if (!listEl) {
      return;
    }
    if (this._temporaryDisableAutoScroll) {
      this._temporaryDisableAutoScroll = false;
      return;
    }
    const { hasMoreDown } = this.props;
    if (this._isAtBottom && !hasMoreDown) {
      return this.scrollToBottom();
    }
    return;
  }

  private _renderConversationCard(streamItem: StreamItem) {
    const {
      firstHistoryUnreadPostId,
      hasHistoryUnread,
      historyReadThrough,
    } = this.props;

    if (
      (hasHistoryUnread &&
        (firstHistoryUnreadPostId &&
          streamItem.value <= firstHistoryUnreadPostId)) ||
      streamItem.value <= historyReadThrough
    ) {
      // Observe all visibility of posts which are older
      // than the first unread post

      return this._viewedPostFactory(streamItem);
    }
    if (streamItem.value === this.props.mostRecentPostId) {
      return this._mostRecentPostFactory(streamItem);
    }
    return this._ordinaryPostFactory(streamItem);
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

  private _renderStreamItem(streamItem: StreamItem, index: number) {
    const RENDERER_MAP = {
      [StreamItemType.POST]: this._renderConversationCard,
      [StreamItemType.NEW_MSG_SEPARATOR]: this._renderNewMessagesDivider,
      [StreamItemType.DATE_SEPARATOR]: this._renderDateDivider,
    };
    const streamItemRenderer = RENDERER_MAP[streamItem.type];
    return streamItemRenderer.call(this, streamItem, index);
  }

  private get _initialPost() {
    const { groupId, notEmpty, hasMoreUp } = this.props;

    return hasMoreUp ? null : (
      <VisibilitySensor
        offset={VISIBILITY_SENSOR_OFFSET}
        onChange={this._handleFirstUnreadPostVisibilityChange}
      >
        <ConversationInitialPost notEmpty={notEmpty} id={groupId} />
      </VisibilitySensor>
    );
  }

  private _viewedPostFactory(streamItem: StreamItem) {
    return this._visibilityPostWrapper(
      this._handleFirstUnreadPostVisibilityChange,
      streamItem,
    );
  }

  private _mostRecentPostFactory(streamItem: StreamItem) {
    return this._visibilityPostWrapper(
      this._handleMostRecentPostRead,
      streamItem,
    );
  }

  private _ordinaryPostFactory(streamItem: StreamItem) {
    const { loading } = this.props;

    return (
      <ConversationPost
        id={streamItem.value}
        key={`ConversationPost${streamItem.value}`}
        ref={this._setPostRef}
        highlight={streamItem.value === this.state._jumpToPostId && !loading}
      />
    );
  }
  private _visibilityPostWrapper(
    onChangeHandler: (isVisible: boolean) => void,
    streamItem: StreamItem,
  ) {
    const { loading } = this.props;
    return (
      <VisibilitySensor
        key={`VisibilitySensor${streamItem.value}`}
        offset={VISIBILITY_SENSOR_OFFSET}
        onChange={onChangeHandler}
      >
        <ConversationPost
          ref={this._setPostRef}
          id={streamItem.value}
          key={`ConversationPost${streamItem.value}`}
          highlight={streamItem.value === this.state._jumpToPostId && !loading}
        />
      </VisibilitySensor>
    );
  }
  private get _streamItems() {
    if (this.props.loading) {
      return [];
    }
    return this.props.items.map(this._renderStreamItem.bind(this));
  }

  private get _jumpToFirstUnreadButton() {
    const {
      t,
      firstHistoryUnreadInPage,
      hasHistoryUnread,
      historyUnreadCount,
    } = this.props;

    const shouldHaveJumpButton =
      hasHistoryUnread &&
      (!firstHistoryUnreadInPage ||
        this._firstHistoryUnreadPostViewed === false);

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
        <section ref={this._listRef}>{this._streamItems}</section>
      </JuiStream>
    );
  }

  @action
  private _handleFirstUnreadPostVisibilityChange = (isVisible: boolean) => {
    if (this._visibilitySensorEnabled) {
      if (isVisible) {
        this._firstHistoryUnreadPostViewed = true;
        this.props.clearHistoryUnread();
      } else if (this._firstHistoryUnreadPostViewed === null) {
        this._firstHistoryUnreadPostViewed = false;
      }
    }
  }
  private _handleMostRecentPostRead = (isVisible: boolean) => {
    const isFocused = document.hasFocus();
    if (!this._visibilitySensorEnabled) {
      return;
    }
    if (!isVisible) {
      return this._setUmiDisplay(true);
    }
    if (isFocused) {
      this.props.markAsRead();
      this._setUmiDisplay(false);
    }
  }

  @action.bound
  private _jumpToFirstUnread = async () => {
    if (this._jumpToFirstUnreadLoading || this._timeout) return;
    this._temporaryDisableAutoScroll = true;
    // Delay 500ms then show loading
    this._timeout = setTimeout(() => {
      this._jumpToFirstUnreadLoading = true;
    },                         LOADING_DELAY);

    const firstUnreadPostId = await this.props.loadPostUntilFirstUnread();
    clearTimeout(this._timeout);
    this._timeout = null;
    this._jumpToFirstUnreadLoading = false;

    const scrollToPostId = firstUnreadPostId
      ? firstUnreadPostId
      : _.first(this.props.postIds);

    if (!scrollToPostId) {
      console.warn(
        `scrollToPostId no found. firstUnreadPostId:${firstUnreadPostId} scrollToPostId:${scrollToPostId}`,
      );
      return;
    }
    this.scrollToPost(scrollToPostId);
  }

  scrollToBottom = async () => {
    const lastItem = _(this.props.items).nth(-1);
    if (lastItem) {
      await nextTick();
      this.scrollToPost(lastItem.value);
    }
  }

  scrollToPost = async (
    scrollToPostId: number,
    options: boolean | ScrollIntoViewOptions = true,
  ) => {
    await nextTick();
    const scrollToPostEl = this._postRefs.get(scrollToPostId);
    if (!scrollToPostEl) {
      mainLogger.warn('scrollToPostEl no found');
      return;
    }
    return scrollToComponent(scrollToPostEl, options);
  }

  private _focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
    this._setUmiDisplay(false);
  }

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
  }

  private _setPostRef = (postRef: any) => {
    if (!postRef) return;
    this._postRefs.set(postRef.props.id, postRef);
  }

  private _setUmiDisplay(value: boolean) {
    this._globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, value);
  }
}
const view = extractView<WithNamespaces & StreamViewProps>(StreamViewComponent);
const StreamView = translate('Conversations')(view);

export { StreamView, StreamViewComponent };
