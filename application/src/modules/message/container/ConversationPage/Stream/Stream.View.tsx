/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, {
  Component, RefObject, createRef, cloneElement,
} from 'react';
import storeManager from '@/store/base/StoreManager';
import {
  observable, runInAction, reaction, action,
} from 'mobx';
import { observer, Observer, Disposer } from 'mobx-react';
import { mainLogger, PerformanceTracer, dataAnalysis } from 'sdk';
import { ConversationInitialPost } from '../../ConversationInitialPost';
import { ConversationPost } from '../../ConversationPost';
import { extractView } from 'jui/hoc/extractView';
import { GLOBAL_KEYS } from '@/store/constants';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiStreamLoading } from 'jui/pattern/ConversationLoading';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
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
import { DefaultLoadingWithDelay, DefaultLoadingMore } from 'jui/hoc';
import { getGlobalValue } from '@/store/utils';
import { goToConversation } from '@/common/goToConversation';
import { JuiConversationCard } from 'jui/pattern/ConversationCard';
import { ERROR_TYPES } from '@/common/catchError';
import { JuiAutoSizer } from 'jui/components/AutoSizer/AutoSizer';
import { MESSAGE_PERFORMANCE_KEYS } from '../../../performanceKeys';

type Props = WithTranslation & StreamViewProps & StreamProps;

type StreamItemPost = StreamItem & { value: number[] };

const LOADING_DELAY = 500;
const MINSTREAMITEMHEIGHT = 50;

const POST_PRELOAD_COUNT = 20;
const POST_PRELOAD_DIRECTION = 'up';
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
  private _listRef: React.RefObject<
  JuiVirtualizedListHandles
  > = React.createRef();
  private _globalStore = storeManager.getGlobalStore();
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
    (height?: number) => ({
      minHeight: height,
      display: 'flex',
      flexDirection: 'column',
    } as React.CSSProperties),
  );

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    dataAnalysis.page('Jup_Web/DT_msg_conversationHistory');
  }

  componentDidUpdate(prevProps: Props) {
    const {
      postIds: prevPostIds,
      lastPost: prevLastPost = { id: NaN },
      jumpToPostId: prevJumpToPostId,
      loadingStatus: prevLoadingStatus,
    } = prevProps;
    const {
      postIds,
      mostRecentPostId,
      hasMore,
      lastPost,
      jumpToPostId,
      loadingStatus,
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

    if (loadingStatus === STATUS.SUCCESS && prevLoadingStatus === STATUS.PENDING) {
      this._performanceTracer.end({
        key: MESSAGE_PERFORMANCE_KEYS.UI_MESSAGE_RENDER,
        count: postIds.length,
      });
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
      (!firstHistoryUnreadInPage || this._historyViewed === false);

    const countText =
      historyUnreadCount > 99 ? '99+' : String(historyUnreadCount);

    return shouldHaveJumpButton ? (
      <JumpToFirstUnreadButtonWrapper>
        <JuiLozengeButton
          arrowDirection="up"
          loading={this._jumpToFirstUnreadLoading}
          onClick={this._jumpToFirstUnread}
        >
          {countText} {t('message.stream.newMessages')}
        </JuiLozengeButton>
      </JumpToFirstUnreadButtonWrapper>
    ) : null;
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

  private _handleVisibilityChanged = ({
    startIndex,
    stopIndex,
  }: IndexRange) => {
    const listEl = this._listRef.current;
    if (startIndex === -1 || stopIndex === -1 || !listEl) return;
    const {
      items,
      firstHistoryUnreadPostId = 0,
      historyReadThrough = 0,
    } = this.props;
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
    if (this.props.hasMore('down') || !isAtBottom) {
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

  handleMostRecentViewed = () => {
    if (document.hasFocus()) {
      this.props.markAsRead();
      this.props.disableNewMessageSeparatorHandler();
      this._setUmiDisplay(false);
    }
  };

  handleMostRecentHidden = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._setUmiDisplay(true);
  };

  findPost = (i: StreamItem) => i.type === StreamItemType.POST;

  private _findStreamItemIndexByPostId = (id: number) => this.props.items.findIndex((item: StreamItemPost) => item.type === StreamItemType.POST && item.value === id);

  @action
  private _loadInitialPosts = async () => {
    const { loadInitialPosts, markAsRead, updateHistoryHandler } = this.props;
    await loadInitialPosts();
    runInAction(() => {
      updateHistoryHandler();
      markAsRead();
    });
    this._loadMoreStrategy.updatePreloadCount(
      this.props.historyUnreadCount,
    );
    requestAnimationFrame(() => {
      if (this._jumpToPostRef.current) {
        this._jumpToPostRef.current.highlight();
      }
    });
    this._watchUnreadCount();
  };

  private _defaultLoading() {
    return <DefaultLoadingWithDelay size={36} delay={100} />;
  }

  private _defaultLoadingMore() {
    return <DefaultLoadingMore />;
  }

  private _watchUnreadCount() {
    const disposer = reaction(
      () => this.props.mostRecentPostId,
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
  };

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._setUmiDisplay(true);
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
    const { refresh, postIds } = this.props;
    const highlightPost = () => requestAnimationFrame(() => {
      if (this._jumpToPostRef.current) {
        this._jumpToPostRef.current.highlight();
        goToConversation({
          conversationId: this.props.groupId,
          replaceHistory: true,
        });
      }
    });
    // handle hight and jump to post Id
    if (currentId === prevId) {
      highlightPost();
      return;
    }
    if (postIds.includes(currentId) && this._listRef.current) {
      const index = this._findStreamItemIndexByPostId(currentId);
      this._listRef.current.scrollToIndex(index);
      highlightPost();
    } else {
      refresh();
    }
  }
  private _setUmiDisplay(value: boolean) {
    this._globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, value);
  }
  render() {
    const {
      loadMore, hasMore, items, loadingStatus,
    } = this.props;

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
                (loadingStatus === STATUS.FAILED ? (
                  this._onInitialDataFailed
                ) : (
                  <>
                    {this._renderJumpToFirstUnreadButton()}
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
                ))
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
