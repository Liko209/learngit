/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import RO from 'resize-observer-polyfill';
import storeManager from '@/store/base/StoreManager';
import VisibilitySensor from 'react-visibility-sensor';
import { action, observable, runInAction } from 'mobx';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { ConversationPost } from '@/containers/ConversationPost';
import { extractView } from 'jui/hoc/extractView';
import { getScrollParent, nextTick, scrollToComponent } from './helper';
import { GLOBAL_KEYS } from '@/store/constants';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiStreamLoading } from 'jui/pattern/ConversationLoading';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { mainLogger } from 'sdk';
import { observer } from 'mobx-react';
import { StreamItem, StreamItemType, StreamViewProps } from './types';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { toTitleCase } from '@/utils/string';
import { translate, WithNamespaces } from 'react-i18next';
import { getGlobalValue } from '@/store/utils';

const VISIBILITY_SENSOR_OFFSET = { top: 80 };
const LOADING_DELAY = 500;

type Props = WithNamespaces & StreamViewProps;
type StreamItemPost = StreamItem & { value: number[] };
@observer
class StreamViewComponent extends Component<Props> {
  private _listRef: React.RefObject<HTMLElement> = React.createRef();
  private _postRefs: Map<number, any> = new Map();
  private _visibilitySensorEnabled = false;
  private _isAtBottom = true;
  private _isAtTop = false;
  private _timeout: NodeJS.Timeout | null;
  private _temporaryDisableAutoScroll = false;
  private _scrollHeight = 0;
  private _scrollTop = 0;
  private _ro: ResizeObserver[] = [];
  private _globalStore = storeManager.getGlobalStore();
  private _listLastWidth = 0;
  private _currentUser = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  @observable
  private _hideList = true;
  state = { _jumpToPostId: 0 };

  @observable private _jumpToFirstUnreadLoading = false;
  @observable private _firstHistoryUnreadPostViewed: boolean | null = null;

  static getDerivedStateFromProps(props: Props) {
    if (props.jumpToPostId) {
      return { _jumpToPostId: props.jumpToPostId };
    }
    return null;
  }

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    await this._loadInitialPosts();
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.removeEventListener('blur', this._blurHandler);
    this._ro.forEach((i: RO) => i.disconnect());
    this._detachScrollHandlerToContainer();
  }

  private _detachScrollHandlerToContainer() {
    if (this._listRef.current) {
      getScrollParent(this._listRef.current).removeEventListener(
        'scroll',
        this._recordPosition,
      );
    }
  }

  getSnapshotBeforeUpdate() {
    if (this._listRef.current) {
      const parentEl = getScrollParent(this._listRef.current);
      this._scrollHeight = parentEl.scrollHeight;
      this._scrollTop = parentEl.scrollTop;
    }

    return {};
  }

  async componentDidUpdate(prevProps: StreamViewProps) {
    const {
      hasMoreDown,
      hasMoreUp,
      postIds: prevPostIds,
      lastPost: prevLastPost,
    } = prevProps;
    const { postIds, mostRecentPostId, lastPost: currentLastPost } = this.props;
    const prevSize = prevPostIds.length;

    if (postIds.length && mostRecentPostId) {
      if (!postIds.includes(mostRecentPostId)) {
        storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
      }
    }
    if (prevSize === 0) return;
    // scroll bottom and load post
    if (prevLastPost !== currentLastPost) {
      if (this._isAtBottom && !hasMoreDown) {
        return this.scrollToBottom();
      }
      if (currentLastPost!.creatorId === this._currentUser) {
        return this.scrollToBottom();
      }
    }
    // scroll TOP and load posts
    if (this._isAtTop && hasMoreUp && this._listRef.current) {
      const parent = getScrollParent(this._listRef.current);
      parent.scrollTop =
        this._scrollTop + parent.scrollHeight - this._scrollHeight;
      return;
    }
    return;
  }

  private async _stickToBottom() {
    const el = this._listRef.current;

    if (!el) {
      return;
    }

    const listRO = new RO(this._listHeightChangedHandler);
    listRO.observe(el);
    this._ro.push(listRO);
  }

  private _listHeightChangedHandler = (entries: any[]) => {
    const listEl = this._listRef.current;
    if (!listEl) {
      return;
    }
    if (this._temporaryDisableAutoScroll) {
      this._temporaryDisableAutoScroll = false;
      return;
    }

    const width = entries[0].contentRect.width;
    if (this._listLastWidth && this._listLastWidth !== width) {
      this._listLastWidth = width;
      return;
    }

    if (this._isAtBottom && !this.props.hasMoreDown) {
      return this.scrollToBottom();
    }

    return;
  }

  private _renderPost(streamItem: StreamItem & { value: number[] }) {
    const { firstHistoryUnreadPostId, historyReadThrough } = this.props;

    const checkFirstUnreadVisibility = streamItem.value.some((id: number) => {
      const isPreInsertPost = id <= 0;
      const isUnreadPostFallBack =
        firstHistoryUnreadPostId && id <= firstHistoryUnreadPostId;
      const isUnreadPost = id <= historyReadThrough;
      return !!((isUnreadPost || isUnreadPostFallBack) && !isPreInsertPost);
    });

    const checkMostRecentVisibility = streamItem.value.includes(
      this.props.mostRecentPostId,
    );

    return this._renderPostWithVisibilitySensor({
      streamItem,
      onVisibilityChangeHandler: (visibility: boolean) => {
        if (checkFirstUnreadVisibility) {
          this._handleFirstUnreadPostVisibilityChange(visibility);
        }

        if (checkMostRecentVisibility) {
          this._handleMostRecentPostRead(visibility);
        }
      },
      active:
        this._visibilitySensorEnabled &&
        (checkFirstUnreadVisibility || checkMostRecentVisibility),
    });
  }

  private _renderNewMessagesDivider(streamItem: StreamItem) {
    const { t } = this.props;
    return (
      <TimeNodeDivider
        key="TimeNodeDividerNewMessagesDivider"
        value={toTitleCase(t('message.stream.newMessages'))}
      />
    );
  }

  private _renderDateDivider(streamItem: StreamItem) {
    return (
      <TimeNodeDivider
        key={`TimeNodeDividerDateDivider${streamItem.id}`}
        value={streamItem.id}
      />
    );
  }

  private _renderStreamItem = (
    streamItem: StreamItem,
    index: number,
  ): JSX.Element => {
    const RENDERER_MAP = {
      [StreamItemType.POST]: this._renderPost,
      [StreamItemType.NEW_MSG_SEPARATOR]: this._renderNewMessagesDivider,
      [StreamItemType.DATE_SEPARATOR]: this._renderDateDivider,
    };
    const streamItemRenderer = RENDERER_MAP[streamItem.type];
    return streamItemRenderer.call(this, streamItem, index);
  }

  private _renderInitialPost() {
    const { groupId, notEmpty, hasMoreUp } = this.props;

    return hasMoreUp ? null : (
      <VisibilitySensor
        offset={VISIBILITY_SENSOR_OFFSET}
        onChange={this._handleFirstUnreadPostVisibilityChange}
        active={this._visibilitySensorEnabled}
      >
        <ConversationInitialPost notEmpty={notEmpty} id={groupId} />
      </VisibilitySensor>
    );
  }

  private _renderPostWithVisibilitySensor({
    onVisibilityChangeHandler,
    streamItem,
    active,
  }: {
    onVisibilityChangeHandler: (isVisible: boolean) => void;
    streamItem: StreamItemPost;
    active?: boolean;
  }) {
    const { loading } = this.props;
    return (
      <VisibilitySensor
        key={`VisibilitySensor${streamItem.id}`}
        offset={VISIBILITY_SENSOR_OFFSET}
        onChange={onVisibilityChangeHandler}
        active={active}
      >
        <>
          {streamItem.value.map((postId: number) => (
            <ConversationPost
              ref={this._setPostRef}
              id={postId}
              key={`ConversationPost${postId}`}
              highlight={postId === this.state._jumpToPostId && !loading}
            />
          ))}
        </>
      </VisibilitySensor>
    );
  }

  private _renderStreamItems() {
    return this.props.items.map(this._renderStreamItem);
  }

  private _renderJumpToFirstUnreadButton() {
    const {
      t,
      firstHistoryUnreadInPage,
      hasHistoryUnread,
      historyUnreadCount,
    } = this.props;

    const shouldHaveJumpButton =
      hasHistoryUnread &&
      historyUnreadCount > 1 &&
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
          {countText} {toTitleCase(t('message.stream.newMessages'))}
        </JuiLozengeButton>
      </JumpToFirstUnreadButtonWrapper>
    ) : null;
  }

  render() {
    const { loadInitialPostsError, t } = this.props;

    return loadInitialPostsError ? (
      <JuiStreamLoading
        showTip={!!loadInitialPostsError}
        tip={t('translations:message.prompt.MessageLoadingErrorTip')}
        linkText={t('translations:common.prompt.tryAgain')}
        onClick={this._loadInitialPosts}
      />
    ) : (
      <JuiStream style={{ visibility: this._hideList ? 'hidden' : 'visible' }}>
        {this._renderJumpToFirstUnreadButton()}
        {this._renderInitialPost()}
        <section ref={this._listRef}>{this._renderStreamItems()}</section>
      </JuiStream>
    );
  }
  @action.bound
  private _loadInitialPosts = async () => {
    const { loadInitialPosts, updateHistoryHandler, markAsRead } = this.props;
    const { _jumpToPostId } = this.state;
    await loadInitialPosts();
    if (!this._listRef.current) {
      return; // the current component is unmounted
    }
    this._attachScrollHandlerToContainer();
    this._stickToBottom();
    _jumpToPostId
      ? await this.scrollToPost(_jumpToPostId)
      : await this.scrollToBottom();
    runInAction(() => {
      this._visibilitySensorEnabled = true;
      updateHistoryHandler();
      markAsRead();
      this._hideList = false;
    });
  }

  private _attachScrollHandlerToContainer() {
    if (!this._listRef.current) {
      return;
    }
    getScrollParent(this._listRef.current).addEventListener(
      'scroll',
      this._recordPosition,
      {
        capture: true,
        passive: true,
      },
    );
  }

  @action
  private _handleFirstUnreadPostVisibilityChange = (isVisible: boolean) => {
    if (isVisible) {
      this._firstHistoryUnreadPostViewed = true;
      this.props.clearHistoryUnread();
    } else if (this._firstHistoryUnreadPostViewed === null) {
      this._firstHistoryUnreadPostViewed = false;
    }
  }

  @action
  private _handleMostRecentPostRead = (isVisible: boolean) => {
    if (isVisible) {
      if (document.hasFocus()) {
        this.props.markAsRead();
        this._setUmiDisplay(false);
      }
    } else {
      return this._setUmiDisplay(true);
    }
  }

  @action
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
    const listEl = this._listRef.current;
    if (!listEl) {
      return;
    }
    const lastChildEl = listEl && listEl.lastElementChild;
    if (lastChildEl) {
      await nextTick();
      lastChildEl.scrollIntoView(false);
    }
    this._isAtBottom = true;
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

  private _recordPosition = () => {
    this._isAtBottom = this.props.atBottom();
    this._isAtTop = this.props.atTop();
  }

  private _focusHandler = () => {
    const { atBottom, markAsRead } = this.props;
    atBottom() && markAsRead();
    this._setUmiDisplay(false);
  }

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._setUmiDisplay(true);
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
const StreamView = translate('translations')(view);

export { StreamView, StreamViewComponent };
