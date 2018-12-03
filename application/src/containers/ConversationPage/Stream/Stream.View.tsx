/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import { observable, action, autorun } from 'mobx';
import { observer, Disposer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ConversationPost } from '@/containers/ConversationPost';
import VisibilitySensor from 'react-visibility-sensor';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { toTitleCase } from '@/utils/string';
import { scrollToComponent } from './helper';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import {
  StreamViewProps,
  StreamItem,
  StreamItemType,
  StreamSnapshot,
} from './types';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { extractView } from 'jui/hoc/extractView';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { mainLogger } from 'sdk';

const VISIBILITY_SENSOR_OFFSET = { top: 80 };

type Props = WithNamespaces & StreamViewProps;
@observer
class StreamViewComponent extends Component<Props> {
  private _listRef: React.RefObject<HTMLElement> = React.createRef();
  private _stickToDisposer: Disposer;
  private _postRefs: Map<number, any> = new Map();
  private _visibilitySensorEnabled = false;

  private _timeout: NodeJS.Timeout | null;

  @observable
  private _jumpToFirstUnreadLoading = false;

  @observable
  private _firstHistoryUnreadPostViewed = false;

  private _stickToBottom() {
    if (this._stickToDisposer) {
      this._stickToDisposer();
    }

    this._stickToDisposer = autorun(() => {
      let item: StreamItem | undefined;
      let post: PostModel;
      item = _(this.props.items).nth(-1);
      if (!item || !item.value) {
        return;
      }
      post = getEntity(ENTITY_NAME.POST, item!.value);
      const likes = post!.likes || [];
      if (likes.length === 1) {
        this.scrollToPost(this.props.mostRecentPostId);
      }
    });
  }

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    await this.props.loadInitialPosts();
    await this.scrollToPost(
      this.props.jumpToPostId || this.props.mostRecentPostId,
    );
    this._stickToBottom();
    this.props.updateHistoryHandler();
    this.props.markAsRead();
    this._visibilitySensorEnabled = true;
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.removeEventListener('blur', this._blurHandler);
    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
    this._stickToDisposer && this._stickToDisposer();
  }

  getSnapshotBeforeUpdate(): StreamSnapshot {
    const { atBottom, atTop } = this.props;
    return { atBottom: atBottom(), atTop: atTop() };
  }

  async componentDidUpdate(
    prevProps: Props,
    state: Props,
    snapshot: StreamSnapshot,
  ): Promise<void> {
    const {
      groupId,
      postIds,
      loadInitialPosts,
      updateHistoryHandler,
      markAsRead,
    } = this.props;
    const { groupId: prevGroupId, postIds: prevPostIds } = prevProps;
    const { atTop, atBottom } = snapshot;

    // Switch to new conversation
    if (groupId !== prevGroupId) {
      this._tidiesBeforeDestroy();
      await loadInitialPosts();
      await this.scrollToPost(
        this.props.jumpToPostId || this.props.mostRecentPostId,
      );
      this._stickToBottom();
      updateHistoryHandler();
      markAsRead();
      this._visibilitySensorEnabled = true;
      return;
    }

    // One new message came in
    if (this.props.postIds.length === prevProps.postIds.length + 1) {
      if (atBottom && !prevProps.hasMoreDown) {
        this.scrollToBottom();
        return;
      }
    }

    // User scroll up and load more posts
    const MorePostsInserted = postIds.length > prevPostIds.length;
    if (atTop && MorePostsInserted) {
      this.scrollToPost(prevProps.postIds[0]);
      return;
    }
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
    const { groupId, hasMoreUp } = this.props;
    return hasMoreUp ? null : (
      <VisibilitySensor
        offset={VISIBILITY_SENSOR_OFFSET}
        onChange={this._handleFirstUnreadPostVisibilityChange}
      >
        <ConversationInitialPost id={groupId} />
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
    const { jumpToPostId, loading } = this.props;
    return (
      <ConversationPost
        id={streamItem.value}
        key={`ConversationPost${streamItem.value}`}
        ref={this._setPostRef}
        highlight={streamItem.value === jumpToPostId && !loading}
        onHighlightAnimationStart={this.props.resetJumpToPostId}
      />
    );
  }
  private _visibilityPostWrapper(
    onChangeHandler: (isVisible: boolean) => void,
    streamItem: StreamItem,
  ) {
    const { jumpToPostId, loading } = this.props;
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
          highlight={streamItem.value === jumpToPostId && !loading}
          onHighlightAnimationStart={this.props.resetJumpToPostId}
        />
      </VisibilitySensor>
    );
  }
  private get _streamItems() {
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
      (!firstHistoryUnreadInPage || !this._firstHistoryUnreadPostViewed);

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
    if (this._visibilitySensorEnabled && isVisible) {
      this._firstHistoryUnreadPostViewed = true;
      this.props.clearHistoryUnread();
    }
  }
  private _handleMostRecentPostRead = (isVisible: boolean) => {
    const isFocused = document.hasFocus();
    if (this._visibilitySensorEnabled && isVisible && isFocused) {
      this.props.markAsRead();
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

  scrollToBottom = () => {
    const lastItem = _(this.props.items).nth(-1);
    if (lastItem) {
      window.requestAnimationFrame(() => {
        this.scrollToPost(lastItem.value, false);
      });
    }
  }

  scrollToPost = (
    scrollToPostId: number,
    options?: boolean | ScrollIntoViewOptions,
  ) => {
    return new Promise((resolve: Function) => {
      const scrollToViewOpt = options || {
        behavior: 'auto',
        block: 'start',
      };
      window.requestAnimationFrame(() => {
        const scrollToPostEl = this._postRefs.get(scrollToPostId);
        if (!scrollToPostEl) {
          mainLogger.warn('scrollToPostEl no found');
          return;
        }
        scrollToComponent(scrollToPostEl, scrollToViewOpt).then(() =>
          resolve(),
        );
      });
    });
  }

  private _focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
  }

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
  }

  private _setPostRef = (postRef: any) => {
    if (!postRef) return;
    this._postRefs.set(postRef.props.id, postRef);
  }

  private _tidiesBeforeDestroy = () => {
    this._visibilitySensorEnabled = false;
    this._jumpToFirstUnreadLoading = false;
    this._firstHistoryUnreadPostViewed = false;
    this._postRefs.clear();
  }
}
const view = extractView<WithNamespaces & StreamViewProps>(StreamViewComponent);
const StreamView = translate('Conversations')(view);

export { StreamView, StreamViewComponent };
