/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import storeManager from '@/store/base/StoreManager';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import ReactResizeDetector from 'react-resize-detector';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { ConversationPost } from '@/containers/ConversationPost';
import { extractView } from 'jui/hoc/extractView';
import { GLOBAL_KEYS } from '@/store/constants';
import { JuiLozengeButton } from 'jui/components/Buttons';
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
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiInfiniteList,
  IndexRange,
  JuiVirtualizedListHandles,
} from 'jui/components/VirtualizedList';
import { DefaultLoadingWithDelay, DefaultLoadingMore } from 'jui/hoc';
import { getGlobalValue } from '@/store/utils';

type Props = WithNamespaces & StreamViewProps & StreamProps;
type StreamItemPost = StreamItem & { value: number[] };

const LOADING_DELAY = 500;

@observer
class StreamViewComponent extends Component<Props> {
  private currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  private _listRef: React.RefObject<
    JuiVirtualizedListHandles
  > = React.createRef();
  private _globalStore = storeManager.getGlobalStore();
  private _historyViewed = false;
  private _mostRecentViewed = false;
  private _timeout: NodeJS.Timeout | null;
  state = { _jumpToPostId: 0 };

  @observable private _jumpToFirstUnreadLoading = false;

  static getDerivedStateFromProps(props: Props) {
    if (props.jumpToPostId) {
      return { _jumpToPostId: props.jumpToPostId };
    }
    return null;
  }

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.removeEventListener('blur', this._blurHandler);
  }

  async componentDidUpdate(prevProps: StreamViewProps) {
    const {
      postIds: prevPostIds,
      lastPost: prevLastPost = { id: NaN },
    } = prevProps;
    const { postIds, mostRecentPostId, hasMore, lastPost } = this.props;
    if (postIds.length && mostRecentPostId) {
      if (!postIds.includes(mostRecentPostId)) {
        storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
      }
    }
    const newPostAddedAtEnd =
      prevPostIds.length !== 0 &&
      postIds.length >= prevPostIds.length &&
      lastPost &&
      lastPost.id !== prevLastPost.id;

    if (newPostAddedAtEnd) {
      const sentFromCurrentUser =
        !hasMore('down') &&
        lastPost &&
        lastPost.creatorId === this.currentUserId;

      if (sentFromCurrentUser && this._listRef.current) {
        this._listRef.current.scrollToBottom();
      }
    }
  }

  private _renderPost(streamItem: StreamItem & { value: number[] }) {
    return (
      <div key={streamItem.id}>
        {streamItem.value.map((postId: number) => (
          <ConversationPost
            id={postId}
            key={`ConversationPost${postId}`}
            highlight={postId === this.state._jumpToPostId}
          />
        ))}
      </div>
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
    return <ConversationInitialPost notEmpty={notEmpty} id={groupId} key={1} />;
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

    const firstUnreadPostId = await this.props.loadPostUntilFirstUnread();
    clearTimeout(this._timeout);
    this._timeout = null;
    this._jumpToFirstUnreadLoading = false;
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
    const lastPostItem = _.findLast(
      visibleItems,
      this.findPost,
    ) as StreamItemPost;

    if (lastPostItem && lastPostItem.value.includes(mostRecentPostId)) {
      this.handleMostRecentViewed();
    } else {
      this.handleMostRecentHidden();
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
    if (this._mostRecentViewed) {
      return;
    }
    if (document.hasFocus()) {
      this.props.markAsRead();
      this._setUmiDisplay(false);
    }
    this._mostRecentViewed = true;
  }

  handleMostRecentHidden = () => {
    if (!this._mostRecentViewed) {
      return;
    }
    this._setUmiDisplay(true);
    this._mostRecentViewed = false;
  }

  findPost = (i: StreamItem) => {
    return i.type === StreamItemType.POST;
  }

  render() {
    const { t, loadMore, hasMore, items } = this.props;
    let initialPosition = items.length - 1;
    const { _jumpToPostId } = this.state;
    if (_jumpToPostId) {
      initialPosition = _.findIndex(items, (item: StreamItem) => {
        return !!item.value && item.value.includes(_jumpToPostId);
      });
    }
    const defaultLoading = <DefaultLoadingWithDelay delay={100} />;
    const defaultLoadingMore = <DefaultLoadingMore />;
    const onInitialDataFailed = (
      <JuiStreamLoading
        showTip={true}
        tip={t('translations:message.prompt.MessageLoadingErrorTip')}
        linkText={t('translations:common.prompt.tryAgain')}
        onClick={this._loadInitialPosts}
      />
    );

    return (
      <ReactResizeDetector handleHeight={true}>
        {({ height }: { height: number }) => (
          <JuiStream>
            {this._renderJumpToFirstUnreadButton()}
            <JuiInfiniteList
              ref={this._listRef}
              height={height}
              stickToBottom={true}
              initialScrollToIndex={initialPosition}
              minRowHeight={50} // extract to const
              loadInitialData={this._loadInitialPosts}
              loadMore={loadMore}
              loadingRenderer={defaultLoading}
              hasMore={hasMore}
              loadingMoreRenderer={defaultLoadingMore}
              fallBackRenderer={onInitialDataFailed}
              onVisibleRangeChange={this._handleVisibilityChanged}
            >
              {this._renderStreamItems()}
            </JuiInfiniteList>
          </JuiStream>
        )}
      </ReactResizeDetector>
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
  }

  private _focusHandler = () => {
    const { markAsRead } = this.props;

    const atBottom =
      this._listRef.current && this._listRef.current.isAtBottom();
    atBottom && markAsRead();
    this._setUmiDisplay(false);
  }

  private _blurHandler = () => {
    this.props.enableNewMessageSeparatorHandler();
    this._setUmiDisplay(true);
  }

  private _setUmiDisplay(value: boolean) {
    this._globalStore.set(GLOBAL_KEYS.SHOULD_SHOW_UMI, value);
  }
}
const view = extractView<WithNamespaces & StreamViewProps>(StreamViewComponent);
const StreamView = translate('translations')(view);

export { StreamView, StreamViewComponent };
