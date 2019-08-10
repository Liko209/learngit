/*
 * @Author: Andy Hu
 * @Date: 2018-11-13 18:05:16
 * Copyright © RingCentral. All rights reserved.
 */
import { ISortableModelWithData } from '@/store/base/fetch/types';
import { ERROR_TYPES } from '@/common/catchError';
import PostModel from '@/store/models/Post';
import { STATUS } from '../types';
import { DIRECTION } from 'jui/components/Lists';

enum SeparatorType {
  DATE = 'DATE',
  NEW_MSG = 'NEW_MSG',
}

type Separator = {
  type: SeparatorType;
};

type DateSeparator = {
  type: SeparatorType.DATE;
  timestamp: number;
} & Separator;

type NewSeparator = {
  type: SeparatorType.NEW_MSG;
} & Separator;

enum StreamItemType {
  POST = 'POST',
  DATE_SEPARATOR = 'DATE_SEPARATOR',
  NEW_MSG_SEPARATOR = 'NEW_MSG_SEPARATOR',
  INITIAL_POST = 'INITIAL_POST',
}

type BaseElement = {
  type: StreamItemType;
  value: number;
  meta?: any;
};

type StreamItem = {
  id: number;
  type: StreamItemType;
  timeStart: number;
  timeEnd?: number;
  value?: number;
  meta?: any;
};

type StreamProps = {
  groupId: number;
  viewRef: React.RefObject<any>;
  refresh: () => void;
  jumpToPostId?: number;
  updateConversationStatus: (status: STATUS) => void;
};

type StreamViewProps = {
  errorType: ERROR_TYPES;
  mostRecentPostId: number;
  firstHistoryUnreadInPage: boolean;
  postIds: number[];
  jumpToPostId: number;
  items: StreamItem[];
  hasMore: (direction: DIRECTION) => boolean;
  notEmpty: boolean;
  markAsRead: () => void;
  updateIgnoredStatus: (isIgnore: boolean) => void;
  loadInitialPosts: () => Promise<void>;
  enableNewMessageSeparatorHandler: () => void;
  disableNewMessageSeparatorHandler: () => void;
  handleNewMessageSeparatorState: (event: React.UIEvent<HTMLElement>) => void;
  getFirstUnreadPostByLoadAllUnread: () => Promise<number | undefined>;
  updateHistoryHandler: () => void;
  hasHistoryUnread: boolean;
  clearHistoryUnread: () => void;
  historyUnreadCount: number;
  historyReadThrough?: number;
  firstHistoryUnreadPostId?: number;
  loadInitialPostsError?: Error;
  loadingStatus: STATUS;
  loading?: boolean;
  lastPost?: PostModel;
  loadMore: (direction: 'up' | 'down', count: number) => Promise<void>;
  hasNewMessageSeparator: () => boolean;
  findNewMessageSeparatorIndex: () => number;
  findPostIndex: (postId?: number) => number;
};

type StreamSnapshot = {
  atBottom: boolean;
  atTop: boolean;
};

type IStreamItemSortableModelData = StreamItem;

interface IStreamItemSortableModel
  extends ISortableModelWithData<IStreamItemSortableModelData> {}

export {
  STATUS,
  StreamSnapshot,
  StreamProps,
  StreamViewProps,
  StreamItemType,
  BaseElement,
  StreamItem,
  SeparatorType,
  Separator,
  DateSeparator,
  NewSeparator,
  IStreamItemSortableModelData,
  IStreamItemSortableModel,
};
