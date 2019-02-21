/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import storeManager from '@/store/base/StoreManager';
import { action, observable } from 'mobx';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';
import { ConversationPost } from '@/containers/ConversationPost';
import { extractView } from 'jui/hoc/extractView';
import { GLOBAL_KEYS } from '@/store/constants';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { JuiStreamLoading } from 'jui/pattern/ConversationLoading';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellProps,
  JuiVirtualListRowsRenderInfo,
} from 'jui/pattern/VirtualList';
import { JumpToFirstUnreadButtonWrapper } from './JumpToFirstUnreadButtonWrapper';
import { observer } from 'mobx-react';
import { StreamItem, StreamItemType, StreamViewProps } from './types';
import { TimeNodeDivider } from '../TimeNodeDivider';
import { toTitleCase } from '@/utils/string';
import { translate, WithNamespaces } from 'react-i18next';

const LOADING_DELAY = 500;

type Props = WithNamespaces & StreamViewProps;
type StreamItemPost = StreamItem & { value: number[] };

@observer
class StreamViewComponent extends Component<Props>
  implements IVirtualListDataSource<number, StreamItem> {
  private _timeout: NodeJS.Timeout | null;
  private _globalStore = storeManager.getGlobalStore();
  private _listRef = React.createRef<JuiVirtualList<number, StreamItem>>();
  @observable private _loadingContent = false;
  @observable private _loadingMoreUp = false;
  @observable private _loadingMoreDown = false;
  private _isMostRecentPostVisibleBefore: boolean;
  state = { _jumpToPostId: 0 };

  @observable private _jumpToFirstUnreadLoading = false;
  @observable private _firstHistoryUnreadPostViewed: boolean | null = null;

  static getDerivedStateFromProps(props: Props) {
    if (props.jumpToPostId) {
      return { _jumpToPostId: props.jumpToPostId };
    }
    return null;
  }

  get(index: number) {
    const { hasMoreUp } = this.props;
    if (hasMoreUp) {
      return this.props.items[index];
    }
    return this.props.items[index - 1];
  }

  size() {
    const { hasMoreUp } = this.props;
    return this.props.items.length + (hasMoreUp ? 0 : 1);
  }

  hasMore(direction: 'up' | 'down') {
    let hasMore = false;
    if ('down' === direction) {
      hasMore = this.props.hasMoreDown;
    }
    if ('up' === direction) {
      hasMore = this.props.hasMoreUp;
    }
    return hasMore;
  }

  rowRenderer = (params: JuiVirtualCellProps<StreamItem>) => {
    const { hasMoreUp } = this.props;
    const { index, item: streamItem } = params;
    if (!hasMoreUp && index === 0) {
      return this._renderInitialPost();
    }
    return this._renderStreamItem(streamItem);
  }

  async loadMore(
    startIndex: number,
    stopIndex: number,
    direction: 'up' | 'down',
  ) {
    if ('up' === direction) {
      this._loadingMoreUp = true;
      await this.props.loadPrevPosts(20);
      this._loadingMoreUp = false;
    }

    if ('down' === direction) {
      this._loadingMoreUp = true;
      await this.props.loadNextPosts(stopIndex - startIndex + 1);
      this._loadingMoreUp = false;
    }
    return;
  }

  isLoadingContent() {
    return this._loadingContent;
  }

  isLoadingMore(direction: 'up' | 'down') {
    if ('up' === direction) return this._loadingMoreUp;
    if ('down' === direction) return this._loadingMoreDown;
    return false;
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
    const { postIds, mostRecentPostId } = this.props;
    if (postIds.length && mostRecentPostId) {
      if (!postIds.includes(mostRecentPostId)) {
        storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
      }
    }
  }

  private _renderPost(streamItem: StreamItemPost) {
    return streamItem.value.map((postId: number) => (
      <ConversationPost
        id={postId}
        key={`ConversationPost${postId}`}
        highlight={postId === this.state._jumpToPostId}
      />
    ));
  }

  private _renderNewMessagesDivider() {
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
        key={`TimeNodeDividerDateDivider${streamItem.id}`}
        value={streamItem.id}
      />
    );
  }

  private _renderStreamItem = (streamItem: StreamItem): JSX.Element => {
    const RENDERER_MAP = {
      [StreamItemType.POST]: this._renderPost,
      [StreamItemType.NEW_MSG_SEPARATOR]: this._renderNewMessagesDivider,
      [StreamItemType.DATE_SEPARATOR]: this._renderDateDivider,
    };
    const streamItemRenderer = RENDERER_MAP[streamItem.type];
    return streamItemRenderer.call(this, streamItem);
  }

  private _renderInitialPost() {
    const { groupId, notEmpty } = this.props;
    return <ConversationInitialPost notEmpty={notEmpty} id={groupId} />;
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
          {countText} {toTitleCase(t('newMessage_plural'))}
        </JuiLozengeButton>
      </JumpToFirstUnreadButtonWrapper>
    ) : null;
  }

  private _rowsRenderedHandler = (info: JuiVirtualListRowsRenderInfo) => {
    const { startIndex, stopIndex } = info;
    this._handleNewMessageRead(startIndex, stopIndex);
    this._handleMostRecentPostIdRead(stopIndex);
  }

  @action
  private _handleNewMessageRead(startIndex: number, stopIndex: number) {
    if (this._firstHistoryUnreadPostViewed) {
      return;
    }
    const firstUnreadMsgId = this.props.firstHistoryUnreadPostId;
    if (!firstUnreadMsgId) {
      return;
    }
    const newMsgTagIndex = this.props.items.findIndex(
      (i: StreamItem) => !!(i.value && i.value.includes(firstUnreadMsgId)),
    );

    const isVisible =
      startIndex <= newMsgTagIndex && newMsgTagIndex <= stopIndex;
    if (isVisible) {
      this.props.clearHistoryUnread();
    }
    this._firstHistoryUnreadPostViewed = isVisible;
  }

  private _handleMostRecentPostIdRead(stopIndex: number) {
    if (this.props.hasMoreDown) {
      return;
    }
    const MostRecentMsgTagIndex = this.size() - 1;
    const isVisible = stopIndex >= MostRecentMsgTagIndex;
    if (isVisible === this._isMostRecentPostVisibleBefore) {
      return;
    }
    if (isVisible) {
      if (document.hasFocus()) {
        this.props.markAsRead();
        this._setUmiDisplay(false);
      }
    } else {
      this._setUmiDisplay(true);
    }
    this._isMostRecentPostVisibleBefore = isVisible;
  }

  render() {
    const { loadInitialPostsError, t } = this.props;

    return loadInitialPostsError ? (
      <JuiStreamLoading
        showTip={!!loadInitialPostsError}
        tip={t('translations:messageLoadingErrorTip')}
        linkText={t('translations:tryAgain')}
      />
    ) : (
      <JuiStream>
        {this._renderJumpToFirstUnreadButton()}
        <ReactResizeDetector handleWidth={true} handleHeight={true}>
          {(width: number = 0, height: number) => (
            <JuiVirtualList
              ref={this._listRef}
              dataSource={this}
              rowRenderer={this.rowRenderer}
              observeCell={true}
              stickToBottom={true}
              width={width}
              height={height}
              overscan={4}
              threshold={40}
              onBeforeRowsRendered={this._rowsRenderedHandler}
            />
          )}
        </ReactResizeDetector>
      </JuiStream>
    );
  }

  @action.bound
  loadInitialData = async () => {
    const { loadInitialPosts, updateHistoryHandler, markAsRead } = this.props;
    this._loadingContent = true;
    await loadInitialPosts();
    this._loadingContent = false;
    updateHistoryHandler();
    markAsRead();

    this.jumpToInitialPosition();
  }

  async jumpToInitialPosition() {
    if (this._listRef.current) {
      const list = this._listRef.current;
      const { _jumpToPostId } = this.state;
      if (!_jumpToPostId) {
        return;
      }
      const targetItemFilter = (item: StreamItem, id: number) => {
        return !!(item.value && item.value.includes(id));
      };
      const index = this.props.items.findIndex((item: StreamItem) =>
        targetItemFilter(item, _jumpToPostId),
      );
      list.scrollToCell(index);
    }
  }

  @action
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

    const scrollToPostId = firstUnreadPostId
      ? firstUnreadPostId
      : _.first(this.props.postIds);

    if (!scrollToPostId) {
      console.warn(
        `scrollToPostId no found. firstUnreadPostId:${firstUnreadPostId} scrollToPostId:${scrollToPostId}`,
      );
      return;
    }

    this._scrollToPost(scrollToPostId);
  }

  private _scrollToPost(postId: number) {
    const { items } = this.props;
    const postIndex = items.findIndex(
      (item: StreamItem) =>
        !!(
          StreamItemType.POST === item.type &&
          item.value &&
          item.value.includes(postId)
        ),
    );
    if (this._listRef.current && postIndex > -1) {
      this._listRef.current.scrollToCell(postIndex);
    }
  }

  private _focusHandler = () => {
    const { markAsRead } = this.props;
    if (this._isMostRecentPostVisibleBefore) {
      markAsRead();
    }
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
