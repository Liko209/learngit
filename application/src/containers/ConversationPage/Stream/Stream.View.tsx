/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import { observable, action, autorun, Reaction } from 'mobx';
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
import { GLOBAL_KEYS } from '@/store/constants';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';

const VISIBILITY_SENSOR_OFFSET = { top: 80 };

type Props = WithNamespaces & StreamViewProps;

@observer
class StreamViewComponent extends Component<Props> {
  private _listRef: React.RefObject<HTMLElement> = React.createRef();
  private _disposers: Disposer[] = [];
  private _postRefs: Map<number, any> = new Map();

  private _timeout: NodeJS.Timeout | null;

  @observable
  private _jumpToFirstUnreadLoading = false;

  @observable
  private _firstHistoryUnreadPostViewed = false;

  async componentDidMount() {
    window.addEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    await this.props.loadInitialPosts();
    this._scrollToPost(this.props.jumpToPostId || this.props.mostRecentPostId);
    this._stickToBottom();
  }

  private _stickToBottom() {
    const disposer = autorun((r: Reaction) => {
      let item: StreamItem | undefined;
      let post: PostModel;
      item = _(this.props.items).nth(-1);
      if (!item || !item.value) {
        return;
      }
      post = getEntity(ENTITY_NAME.POST, item!.value);
      const likes = post!.likes || [];
      if (likes.length === 1) {
        this._scrollToPost(this.props.mostRecentPostId);
      }
    });
    this._disposers.push(disposer);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this._focusHandler);
    window.addEventListener('blur', this._blurHandler);
    storeManager.getGlobalStore().set(GLOBAL_KEYS.SHOULD_SHOW_UMI, true);
    this._disposers.forEach((i: Disposer) => i());
  }

  getSnapshotBeforeUpdate(): StreamSnapshot {
    const { atBottom, atTop } = this.props;
    return { atBottom: atBottom(), atTop: atTop() };
  }

  async componentDidUpdate(
    prevProps: Props,
    props: Props,
    snapshot: StreamSnapshot,
  ) {
    if (prevProps.groupId !== this.props.groupId) {
      this._jumpToFirstUnreadLoading = false;
      this._firstHistoryUnreadPostViewed = false;
      this._postRefs.clear();
      await this.props.loadInitialPosts();
      this.scrollToBottom();
    }
    if (this.props.postIds.length > prevProps.postIds.length) {
      if (snapshot.atBottom) {
        return this.scrollToBottom();
      }
      if (snapshot.atTop) {
        return this._scrollToPost(prevProps.postIds[0]);
      }
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
          <ConversationPost
            ref={this._setPostRef}
            id={streamItem.value}
            key={`VisibilitySensor${streamItem.value}`}
          />
        </VisibilitySensor>
      );
    }
    if (streamItem.value === this.props.mostRecentPostId) {
      return (
        <VisibilitySensor
          key={`VisibilitySensor${streamItem.value}`}
          onChange={this._handleMostRecentPostRead}
        >
          <ConversationPost
            ref={this._setPostRef}
            id={streamItem.value}
            key={`VisibilitySensor${streamItem.value}`}
          />
        </VisibilitySensor>
      );
    }
    return (
      <ConversationPost
        id={streamItem.value}
        key={streamItem.value}
        ref={this._setPostRef}
      />
    );
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
    return hasMore ? null : (
      <VisibilitySensor
        offset={VISIBILITY_SENSOR_OFFSET}
        onChange={this._handleFirstUnreadPostVisibilityChange}
      >
        <ConversationInitialPost id={groupId} />
      </VisibilitySensor>
    );
  }

  private get _streamItems() {
    return this.props.items.map(item => this._renderStreamItem(item));
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
    const setMethods = this.props.setMethods;
    return (
      <JuiStream>
        {setMethods && setMethods(this.scrollToBottom)}
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
  private _handleMostRecentPostRead = (isVisible: boolean) => {
    if (isVisible) {
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
    this._scrollToPost(scrollToPostId, { behavior: 'smooth', block: 'center' });
  }

  private scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      scrollToComponent(this._listRef.current, false);
    });
  }

  private _scrollToPost = (
    scrollToPostId: number,
    options?: ScrollIntoViewOptions,
  ) => {
    const scrollToViewOpt = options || {
      behavior: 'auto',
      block: 'start',
    };
    window.requestAnimationFrame(() => {
      const scrollToPostEl = this._postRefs.get(scrollToPostId);
      if (!scrollToPostEl) {
        console.warn('scrollToPostEl no found');
        return;
      }
      scrollToComponent(scrollToPostEl, scrollToViewOpt);
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
}

const StreamView = translate('Conversations')(StreamViewComponent);

export { StreamView };
