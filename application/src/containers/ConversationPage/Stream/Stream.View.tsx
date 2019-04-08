/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component, RefObject, createRef } from 'react';
import storeManager from '@/store/base/StoreManager';
import { observable, runInAction, reaction, action } from 'mobx';
import { observer, Observer, Disposer } from 'mobx-react';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { ConversationPost } from '@/containers/ConversationPost';
import { extractView } from 'jui/hoc/extractView';
import { GLOBAL_KEYS } from '@/store/constants';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { JuiSizeMeasurer } from 'jui/components/SizeMeasurer';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiStreamLoading } from 'jui/pattern/ConversationLoading';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import {
  StreamItem,
  StreamItemType,
  StreamViewProps,
  StreamProps,
} from './types';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { toTitleCase } from '@/utils/string';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiInfiniteList,
  IndexRange,
  ThresholdStrategy,
  JuiVirtualizedListHandles,
} from 'jui/components/VirtualizedList';
import { DefaultLoadingWithDelay, DefaultLoadingMore } from 'jui/hoc';
import { getGlobalValue } from '@/store/utils';
import { JuiConversationInitialPostWrapper } from 'jui/pattern/ConversationInitialPost';
import JuiConversationCard from 'jui/pattern/ConversationCard';

type Props = WithTranslation & StreamViewProps & StreamProps;

type StreamItemPost = StreamItem & { value: number[] };

const LOADING_DELAY = 500;

@observer
class StreamViewComponent extends Component<Props> {
  private _currentUserId: number = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  private _loadMoreStrategy = new ThresholdStrategy({
    threshold: 60,
    minBatchCount: 10,
  });
  private _listRef: React.RefObject<
    JuiVirtualizedListHandles
  > = React.createRef();
  private _globalStore = storeManager.getGlobalStore();
  private _historyViewed = false;
  private _timeout: NodeJS.Timeout | null;
  private _jumpToPostRef: RefObject<JuiConversationCard> = createRef();
  private _disposers: Disposer[] = [];

  @observable private _jumpToFirstUnreadLoading = false;

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
  }

  componentWillUnmount() {
    this._disposers.forEach((disposer: Disposer) => disposer());
    window.removeEventListener('focus', this._focusHandler);
    window.removeEventListener('blur', this._blurHandler);
  }

  async componentDidUpdate(prevProps: Props) {
    const {
      postIds: prevPostIds,
      lastPost: prevLastPost = { id: NaN },
      jumpToPostId: prevJumpToPostId,
    } = prevProps;
    const {
      postIds,
      mostRecentPostId,
      hasMore,
      lastPost,
      jumpToPostId,
    } = this.props;

    if (postIds.length && mostRecentPostId) {
      if (!postIds.includes(mostRecentPostId)) {
        storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
      }
    }
    const newPostAddedAtEnd =
      prevPostIds.length !== 0 &&
      // TODO this is a Hotfix for FIJI-4825
      postIds.length - prevPostIds.length === 1 &&
      lastPost &&
      lastPost.id !== prevLastPost.id;

    if (newPostAddedAtEnd) {
      const sentFromCurrentUser =
        !hasMore('down') &&
        lastPost &&
        lastPost.creatorId === this._currentUserId;

      if (sentFromCurrentUser && this._listRef.current) {
        this._listRef.current.scrollToBottom();
      }
    }

    jumpToPostId && this._handleJumpToIdChanged(jumpToPostId, prevJumpToPostId);
  }

  private _handleJumpToIdChanged(currentId: number, prevId?: number) {
    const { refresh, postIds } = this.props;
    // handle hight and jump to post Id
    if (currentId === prevId) {
      return;
    }
    if (postIds.includes(currentId) && this._listRef.current) {
      const index = this._findStreamItemIndexByPostId(currentId);
      this._listRef.current.scrollToIndex(index);
      requestAnimationFrame(() => {
        if (this._jumpToPostRef.current) {
          this._jumpToPostRef.current.highlight();
        }
      });
    } else {
      refresh();
    }
  }

  private _renderPost(streamItem: StreamItem & { value: number[] }) {
    const postId = streamItem.value[0];
    return (
      <ConversationPost
        id={postId}
        key={`ConversationPost${streamItem.id}`}
        cardRef={
          postId === this.props.jumpToPostId ? this._jumpToPostRef : undefined
        }
      />
    );
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
      [StreamItemType.INITIAL_POST]: this._renderInitialPost,
    };
    const streamItemRenderer = RENDERER_MAP[streamItem.type];
    return streamItemRenderer.call(this, streamItem, index);
  }

  private _renderInitialPost() {
    const { groupId, notEmpty } = this.props;
    return (
      <JuiConversationInitialPostWrapper key="ConversationInitialPost">
        <ConversationInitialPost notEmpty={notEmpty} id={groupId} />
      </JuiConversationInitialPostWrapper>
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
      (!firstHistoryUnreadInPage || !this._historyViewed);

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

  private _jumpToFirstUnread = async () => {
    if (this._jumpToFirstUnreadLoading || this._timeout) return;
    // Delay 500ms then show loading
    this._timeout = setTimeout(() => {
      this._jumpToFirstUnreadLoading = true;
    },                         LOADING_DELAY);

    try {
      const firstUnreadPostId = await this.props.loadPostUntilFirstUnread();
      const index = firstUnreadPostId
        ? this.props.items.findIndex(
            (item: StreamItemPost) =>
              item.type === StreamItemType.POST &&
              item.value.includes(firstUnreadPostId),
          )
        : 0;

      if (index === -1) {
        console.warn(
          `scrollToPostId no found. firstUnreadPostId:${firstUnreadPostId} scrollToPostId:${index}`,
        );
        return;
      }
      this._listRef.current && this._listRef.current.scrollToIndex(index);
      this.handleFirstUnreadViewed();
    } finally {
      clearTimeout(this._timeout);
      this._timeout = null;
      this._jumpToFirstUnreadLoading = false;
    }
  }

  private _handleVisibilityChanged = ({
    startIndex,
    stopIndex,
  }: IndexRange) => {
    if (startIndex === -1 || stopIndex === -1) return;
    const {
      items,
      mostRecentPostId,
      firstHistoryUnreadPostId = 0,
      historyReadThrough = 0,
    } = this.props;
    const visibleItems = items.slice(startIndex, stopIndex + 1);
    const visiblePosts = _(visibleItems)
      .flatMap('value')
      .concat();
    if (
      this.props.hasMore('down') ||
      !visiblePosts.includes(mostRecentPostId)
    ) {
      this.handleMostRecentHidden();
    } else {
      this.handleMostRecentViewed();
    }
    if (this._historyViewed) {
      return;
    }
    const firstPostItem = _.find(visibleItems, this.findPost) as StreamItemPost;
    if (firstPostItem) {
      const isHistoryRead = firstPostItem.value.some(
        (i: number) =>
          0 <= i && (i <= historyReadThrough || i <= firstHistoryUnreadPostId),
      );
      if (isHistoryRead) {
        this.handleFirstUnreadViewed();
      }
    }
  }

  handleFirstUnreadViewed = () => {
    this._historyViewed = true;
    this.props.clearHistoryUnread();
  }

  handleMostRecentViewed = () => {
    if (document.hasFocus()) {
      this.props.markAsRead();
      this.props.disableNewMessageSeparatorHandler();
      this._setUmiDisplay(false);
    }
  }

  handleMostRecentHidden = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._setUmiDisplay(true);
  }

  findPost = (i: StreamItem) => {
    return i.type === StreamItemType.POST;
  }

  private _findStreamItemIndexByPostId = (id: number) => {
    return this.props.items.findIndex((i: StreamItemPost) => {
      return i.type === StreamItemType.POST && i.value.includes(id);
    });
  }

  private _contentStyleGen = _.memoize(
    (height?: number) =>
      ({
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
      } as React.CSSProperties),
  );

  private _onInitialDataFailed = (
    <JuiStreamLoading
      showTip={true}
      tip={this.props.t('translations:message.prompt.MessageLoadingErrorTip')}
      linkText={this.props.t('translations:common.prompt.tryAgain')}
      onClick={this._loadInitialPosts}
    />
  );

  render() {
    const { loadMore, hasMore, items } = this.props;
    const initialPosition = this.props.jumpToPostId
      ? this._findStreamItemIndexByPostId(this.props.jumpToPostId)
      : items.length - 1;

    const defaultLoading = <DefaultLoadingWithDelay delay={100} />;
    const defaultLoadingMore = <DefaultLoadingMore />;

    return (
      <JuiSizeMeasurer>
        {({ ref, height }) => (
          // MobX only tracks data accessed for observer components
          // if they are directly accessed by render, for render
          // callback, we can wrap it with <Observer>
          // See: https://tinyurl.com/y3nfuybu
          <Observer>
            {() => (
              <JuiStream ref={ref}>
                {this._renderJumpToFirstUnreadButton()}
                <JuiInfiniteList
                  contentStyle={this._contentStyleGen(height)}
                  ref={this._listRef}
                  height={height}
                  stickToBottom={true}
                  loadMoreStrategy={this._loadMoreStrategy}
                  initialScrollToIndex={initialPosition}
                  minRowHeight={50} // extract to const
                  loadInitialData={this._loadInitialPosts}
                  loadMore={loadMore}
                  loadingRenderer={defaultLoading}
                  hasMore={hasMore}
                  loadingMoreRenderer={defaultLoadingMore}
                  fallBackRenderer={this._onInitialDataFailed}
                  onVisibleRangeChange={this._handleVisibilityChanged}
                >
                  {this._renderStreamItems()}
                </JuiInfiniteList>
              </JuiStream>
            )}
          </Observer>
        )}
      </JuiSizeMeasurer>
    );
  }

  @action
  private _loadInitialPosts = async () => {
    const { loadInitialPosts, markAsRead } = this.props;
    await loadInitialPosts();
    runInAction(() => {
      this.props.updateHistoryHandler();
      markAsRead();
    });
    requestAnimationFrame(() => {
      if (this._jumpToPostRef.current) {
        this._jumpToPostRef.current.highlight();
      }
    });
    this._watchUnreadCount();
  }

  private _watchUnreadCount() {
    const disposer = reaction(
      () => {
        return this.props.mostRecentPostId;
      },
      () => {
        if (this._listRef.current && !this.props.hasMore('down')) {
          const isLastPostVisible =
            this._listRef.current.getVisibleRange().stopIndex >=
            this.props.items.length - 1;
          if (isLastPostVisible) {
            this.handleMostRecentViewed();
          }
        }
      },
    );
    this._disposers.push(disposer);
  }

  private _focusHandler = () => {
    const { markAsRead } = this.props;

    const atBottom =
      this._listRef.current && this._listRef.current.isAtBottom();
    if (atBottom) {
      markAsRead();
      this.props.disableNewMessageSeparatorHandler();
      this._setUmiDisplay(false);
    }
  }

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._setUmiDisplay(true);
  }

  private _setUmiDisplay(value: boolean) {
    this._globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, value);
  }
}
const view = extractView<Props>(StreamViewComponent);
const StreamView = withTranslation('translations')(view);

export { StreamView, StreamViewComponent };
