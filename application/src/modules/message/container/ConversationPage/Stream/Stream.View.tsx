/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component, RefObject, createRef, cloneElement } from 'react';
import { observable, runInAction, action } from 'mobx';
import { observer, Observer, Disposer } from 'mobx-react';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { dataAnalysis } from 'foundation/analysis';
import { ConversationInitialPost } from '../../ConversationInitialPost';
import { ConversationPost } from '../../ConversationPost';
import { extractView } from 'jui/hoc/extractView';
import { GLOBAL_KEYS } from '@/store/constants';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiStreamLoading } from 'jui/pattern/ConversationLoading';
import {
  STATUS,
  StreamItem,
  StreamItemType,
  StreamViewProps,
  StreamProps,
} from './types';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiInfiniteList,
  IndexRange,
  ThresholdStrategy,
  JuiVirtualizedListHandles,
  ItemWrapper,
} from 'jui/components/VirtualizedList';
import { DefaultLoadingWithDelay, DefaultLoadingMore } from 'jui/hoc/withLoading';
import { getGlobalValue } from '@/store/utils';
import { goToConversation } from '@/common/goToConversation';
import { JuiConversationCard } from 'jui/pattern/ConversationCard';
import { ERROR_TYPES } from '@/common/catchError';
import { JuiAutoSizer } from 'jui/components/AutoSizer/AutoSizer';
import { MESSAGE_PERFORMANCE_KEYS } from '../../../performanceKeys';
import { AnchorButton } from './AnchorButton';
import { DIRECTION } from 'jui/components/Lists';

type Props = WithTranslation & StreamViewProps & StreamProps;

type StreamItemPost = StreamItem & { value: number[] };

const LOADING_DELAY = 500;
const MINSTREAMITEMHEIGHT = 50;
const checkPointThreshold = 2000;
const POST_PRELOAD_COUNT = 20;
const POST_PRELOAD_DIRECTION = DIRECTION.UP;
@observer
class StreamViewComponent extends Component<Props> {
  private _currentUserId: number = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  private _loadMoreStrategy = new ThresholdStrategy(
    {
      threshold: 60,
      minBatchCount: 10,
    },
    { direction: POST_PRELOAD_DIRECTION, count: POST_PRELOAD_COUNT },
  );

  @observable private _isAboveScrollToLatestCheckPoint = false;
  // use isAtBottom is null to indicate mounting state
  @observable private _isAtBottom: null | boolean = null;

  private _listRef: React.RefObject<
    JuiVirtualizedListHandles
  > = React.createRef();
  @observable private _historyViewed: boolean | null = null;
  private _timeout: NodeJS.Timeout | null;
  private _jumpToPostRef: RefObject<JuiConversationCard> = createRef();
  private _disposers: Disposer[] = [];

  @observable private _jumpToFirstUnreadLoading = false;

  private _performanceTracer: PerformanceTracer = PerformanceTracer.start();

  private _RENDERER_MAP = {
    [StreamItemType.POST]: this._renderPost,
    [StreamItemType.NEW_MSG_SEPARATOR]: this._renderNewMessagesDivider,
    [StreamItemType.DATE_SEPARATOR]: this._renderDateDivider,
    [StreamItemType.INITIAL_POST]: this._renderInitialPost,
  };
  private _contentStyleGen = _.memoize(
    (height?: number) =>
      ({
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
      } as React.CSSProperties),
  );

  private _firstTracer: boolean = false;

  componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    dataAnalysis.page('Jup_Web/DT_msg_conversationHistory');
  }

  componentDidUpdate(prevProps: Props) {
    const {
      postIds: prevPostIds,
      lastPost: prevLastPost = { id: NaN },
      jumpToPostId: prevJumpToPostId,
    } = prevProps;
    const {
      postIds,
      hasMore,
      lastPost,
      jumpToPostId,
    } = this.props;

    const newPostAddedAtEnd =
      prevPostIds.length !== 0 &&
      // TODO this is a Hotfix for FIJI-4825
      postIds.length - prevPostIds.length === 1 &&
      lastPost &&
      lastPost.id !== prevLastPost.id;

    if (newPostAddedAtEnd) {
      const sentFromCurrentUser =
        !hasMore(DIRECTION.DOWN) &&
        lastPost &&
        lastPost.creatorId === this._currentUserId;

      if (sentFromCurrentUser && this._listRef.current) {
        this._listRef.current.scrollToBottom();
      }
    }

    jumpToPostId && this._handleJumpToIdChanged(jumpToPostId, prevJumpToPostId);

    if (this._isAtBottom === null && this._listRef.current) {
      this._isAtBottom = this._listRef.current.isAtBottom();
    }
  }

  /* eslint-disable react/sort-comp */
  componentWillUnmount() {
    this._disposers.forEach((disposer: Disposer) => disposer());
    window.removeEventListener('focus', this._focusHandler);
    window.removeEventListener('blur', this._blurHandler);
  }
  private get _getFailedTip() {
    const { errorType, t } = this.props;
    if (errorType === ERROR_TYPES.NETWORK) {
      return t('message.prompt.MessageLoadingErrorTipForNetworkIssue');
    }
    if (errorType === ERROR_TYPES.NOT_AUTHORIZED) {
      return t('people.prompt.conversationPrivate');
    }
    if (errorType === ERROR_TYPES.BACKEND) {
      return t('message.prompt.MessageLoadingErrorTipForServerIssue');
    }
    return t('message.prompt.MessageLoadingErrorTip');
  }

  private get _getFailedLinkText() {
    const { errorType, t } = this.props;
    if (errorType === ERROR_TYPES.NETWORK) {
      return t('common.prompt.thenTryAgain');
    }
    if (errorType === ERROR_TYPES.NOT_AUTHORIZED) {
      return '';
    }
    if (errorType === ERROR_TYPES.BACKEND) {
      return t('common.prompt.tryAgainLater');
    }
    return t('common.prompt.tryAgain');
  }

  private get _onInitialDataFailed() {
    return (
      <JuiStreamLoading
        showTip
        tip={this._getFailedTip}
        linkText={this._getFailedLinkText}
        onClick={this._loadInitialPosts}
      />
    );
  }
  private _renderStreamItem = (
    streamItem: StreamItem,
    index: number,
  ): JSX.Element => {
    const streamItemRenderer = this._RENDERER_MAP[streamItem.type];
    return streamItemRenderer.call(this, streamItem, index);
  };
  private _renderDateDivider(streamItem: StreamItem) {
    const today = new Date().getDate();
    return (
      <TimeNodeDivider
        key={`TimeNodeDividerDateDivider${streamItem.id}`}
        value={streamItem.id}
        today={today}
      />
    );
  }

  private _renderInitialPost() {
    const { groupId, notEmpty } = this.props;
    return cloneElement(ItemWrapper, {
      key: 'ConversationInitialPost',
      style: { flex: '1 1 auto' },
      children: <ConversationInitialPost notEmpty={notEmpty} id={groupId} />,
    });
  }

  private _renderStreamItems() {
    return this.props.items.map(this._renderStreamItem);
  }

  private _jumpToFirstUnread = async () => {
    if (this._jumpToFirstUnreadLoading || this._timeout) return;
    // Delay 500ms then show loading
    this._timeout = setTimeout(() => {
      this._jumpToFirstUnreadLoading = true;
    }, LOADING_DELAY);

    try {
      const {
        hasNewMessageSeparator,
        findNewMessageSeparatorIndex,
        getFirstUnreadPostByLoadAllUnread,
        findPostIndex,
      } = this.props;
      const firstUnreadPostId = await getFirstUnreadPostByLoadAllUnread();

      const jumpToIndex = hasNewMessageSeparator()
        ? findNewMessageSeparatorIndex()
        : findPostIndex(firstUnreadPostId);

      if (!this._listRef.current) {
        mainLogger.warn(
          'Failed to jump to the first unread post. _listRef no found.',
        );
        return;
      }

      if (jumpToIndex === -1) {
        mainLogger.warn(
          `Failed to jump to the first unread post. scrollToPostId no found. firstUnreadPostId:${firstUnreadPostId} jumpToIndex:${jumpToIndex}`,
        );
        return;
      }

      this._listRef.current.scrollToIndex(jumpToIndex);
      this.handleFirstUnreadViewed();
    } finally {
      clearTimeout(this._timeout);
      this._timeout = null;
      this._jumpToFirstUnreadLoading = false;
    }
  };

  private _jumpToLatest = () => {
    dataAnalysis.track('Jup_Web/DT_msg_jumpToLatestPost');
    this._scrollOrRefresh(this.props.mostRecentPostId);
  };

  @action
  private _handleVisibilityChanged = (
    { startIndex, stopIndex }: IndexRange,
    target?: HTMLElement,
  ) => {
    if(!target) return;
    const { scrollHeight, scrollTop, clientHeight } = target;
    const {
      items,
      firstHistoryUnreadPostId = 0,
      historyReadThrough = 0,
      postIds,
    } = this.props;
    if (!this._firstTracer) {
      this._performanceTracer.end({
        key: MESSAGE_PERFORMANCE_KEYS.UI_MESSAGE_RENDER,
        count: postIds.length,
      });
      this._firstTracer = true;
    }


    const listEl = this._listRef.current;
    const lastPostVisible = stopIndex === items.length - 1;

    this._isAtBottom = lastPostVisible;

    if (lastPostVisible) {
      this._isAboveScrollToLatestCheckPoint = false;
    } else if (!this._isAboveScrollToLatestCheckPoint) {
      const isAboveScrollToLatestCheckPoint =
        scrollHeight - clientHeight - scrollTop > checkPointThreshold;
      this._isAboveScrollToLatestCheckPoint = isAboveScrollToLatestCheckPoint;
    }

    if (startIndex === -1 || stopIndex === -1 || !listEl) return;
    const visibleItems = items.slice(startIndex, stopIndex + 1);

    if (this._historyViewed) {
      return;
    }

    const firstPostItem = _.find(visibleItems, this.findPost) as StreamItemPost;
    if (firstPostItem) {
      const i = firstPostItem.value;
      const isHistoryRead =
        i >= 0 && (i <= historyReadThrough || i <= firstHistoryUnreadPostId);
      if (isHistoryRead) {
        this.handleFirstUnreadViewed();
      } else {
        this._historyViewed = false;
      }
    }
  };

  private _bottomStatusChangeHandler = (isAtBottom: boolean) => {
    if (this.props.hasMore(DIRECTION.DOWN) || !isAtBottom) {
      this.handleMostRecentHidden();
    } else if (isAtBottom) {
      this.handleMostRecentViewed();
    }
  };

  @action
  handleFirstUnreadViewed = () => {
    this._historyViewed = true;
    this.props.clearHistoryUnread();
  };

  @action
  handleMostRecentViewed = () => {
    if (document.hasFocus()) {
      this.props.disableNewMessageSeparatorHandler();
      this._updateIgnoredStatus(true);
    }
  };

  handleMostRecentHidden = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._updateIgnoredStatus(false);
  };

  findPost = (i: StreamItem) => i.type === StreamItemType.POST;

  private _findStreamItemIndexByPostId = (id: number) =>
    this.props.items.findIndex(
      (item: StreamItemPost) =>
        item.type === StreamItemType.POST && item.value === id,
    );

  @action
  private _loadInitialPosts = async () => {
    const { loadInitialPosts, markAsRead, updateHistoryHandler } = this.props;
    await loadInitialPosts();
    runInAction(() => {
      updateHistoryHandler();
      markAsRead();
    });
    this._loadMoreStrategy.updatePreloadCount(this.props.historyUnreadCount);
    requestAnimationFrame(() => {
      if (this._jumpToPostRef.current) {
        this._jumpToPostRef.current.highlight();
      }
    });
  };

  private _defaultLoading() {
    return <DefaultLoadingWithDelay size={36} delay={100} />;
  }

  private _defaultLoadingMore() {
    return <DefaultLoadingMore />;
  }

  private _focusHandler = () => {
    if (this._isAtBottom) {
      this.props.disableNewMessageSeparatorHandler();
      this._updateIgnoredStatus(true);
    }
  };

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._updateIgnoredStatus(false);
  };
  private _renderNewMessagesDivider() {
    const { t } = this.props;
    const dividerText: string = t('message.stream.newMessagesDivider');
    return (
      <TimeNodeDivider
        key="TimeNodeDividerNewMessagesDivider"
        value={dividerText}
      />
    );
  }
  private _renderPost(streamItem: StreamItem & { value: number }) {
    const postId = streamItem.value;
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

  private _handleJumpToIdChanged(currentId: number, prevId?: number) {
    if (currentId === prevId) {
      this._highlightPost();
      return;
    }
    this._scrollOrRefresh(currentId, true);
  }

  private _highlightPost = () =>
    requestAnimationFrame(() => {
      if (this._jumpToPostRef.current) {
        this._jumpToPostRef.current.highlight();
        goToConversation({
          conversationId: this.props.groupId,
          replaceHistory: true,
        });
      }
    });

  private _scrollOrRefresh(postId: number, highlight?: boolean) {
    const { postIds, refresh } = this.props;
    if (postIds.includes(postId) && this._listRef.current) {
      const index = this._findStreamItemIndexByPostId(postId);
      this._listRef.current.scrollToIndex(index);
      highlight && this._highlightPost();
    } else {
      refresh();
    }
  }
  private _updateIgnoredStatus(isIgnored: boolean) {
    this.props.updateIgnoredStatus(isIgnored);
  }

  render() {
    const {
      loadMore,
      hasMore,
      items,
      loadingStatus,
      firstHistoryUnreadInPage,
      hasHistoryUnread,
      historyUnreadCount,
    } = this.props;

    const anchorButtonProps = {
      jumpToLatest: this._jumpToLatest,
      firstHistoryUnreadInPage,
      hasHistoryUnread,
      historyUnreadCount,
      historyViewed: this._historyViewed,
      jumpToFirstUnreadLoading: this._jumpToFirstUnreadLoading,
      jumpToFirstUnread: this._jumpToFirstUnread,
      hasMoreDown: hasMore(DIRECTION.DOWN),
      isAtBottom: this._isAtBottom,
      isAboveScrollToLatestCheckPoint: this._isAboveScrollToLatestCheckPoint,
    };
    const initialPosition = this.props.jumpToPostId
      ? this._findStreamItemIndexByPostId(this.props.jumpToPostId)
      : items.length - 1;
    /* eslint-disable implicit-arrow-linebreak */
    return (
      <JuiStream>
        <JuiAutoSizer>
          {({ height }) => (
            <Observer>
              {() =>
                // MobX only tracks data accessed for observer components
                // if they are directly accessed by render, for render
                // callback, we can wrap it with <Observer>
                // See: https://tinyurl.com/y3nfuybu
                loadingStatus === STATUS.FAILED ? (
                  this._onInitialDataFailed
                ) : (
                    <>
                      <AnchorButton {...anchorButtonProps} />
                      <JuiInfiniteList
                        contentStyle={this._contentStyleGen(height)}
                        ref={this._listRef}
                        height={height}
                        stickToBottom
                        loadMoreStrategy={this._loadMoreStrategy}
                        initialScrollToIndex={initialPosition}
                        minRowHeight={MINSTREAMITEMHEIGHT} // extract to const
                        loadInitialData={this._loadInitialPosts}
                        loadMore={loadMore}
                        loadingRenderer={this._defaultLoading}
                        hasMore={hasMore}
                        loadingMoreRenderer={this._defaultLoadingMore}
                        onVisibleRangeChange={this._handleVisibilityChanged}
                        onBottomStatusChange={this._bottomStatusChangeHandler}
                      >
                        {this._renderStreamItems()}
                      </JuiInfiniteList>
                    </>
                  )
              }
            </Observer>
          )}
        </JuiAutoSizer>
      </JuiStream>
    );
  }
}
const view = extractView<Props>(StreamViewComponent);
const StreamView = withTranslation('translations')(view);

export { StreamView, StreamViewComponent };
