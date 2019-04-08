/*
 * @Author: Andy Hu
 * @Date: 2018-11-13 18:05:16
 * Copyright © RingCentral. All rights reserved.
 */
import { TDelta, ISortableModel } from '../../../store/base/fetch/types';
import PostModel from '../../../store/models/Post';
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
  value?: number[];
  meta?: any;
};

type StreamProps = {
  groupId: number;
  viewRef: React.RefObject<any>;
  refresh: () => void;
  jumpToPostId?: number;
};

type StreamViewProps = {
  mostRecentPostId: number;
  firstHistoryUnreadInPage: boolean;
  postIds: number[];
  jumpToPostId: number;
  items: StreamItem[];
  hasMore: (direction: 'up' | 'down') => boolean;
  notEmpty: boolean;
  markAsRead: () => void;
  loadInitialPosts: () => Promise<void>;
  enableNewMessageSeparatorHandler: () => void;
  disableNewMessageSeparatorHandler: () => void;
  handleNewMessageSeparatorState: (event: React.UIEvent<HTMLElement>) => void;
  loadPostUntilFirstUnread: () => Promise<number | undefined>;
  updateHistoryHandler: () => void;
  hasHistoryUnread: boolean;
  clearHistoryUnread: () => void;
  historyUnreadCount: number;
  historyReadThrough?: number;
  firstHistoryUnreadPostId?: number;
  loadInitialPostsError?: Error;
  loading?: boolean;
  lastPost?: PostModel;
  loadMore: (direction: 'up' | 'down', count: number) => Promise<void>;
};

type StreamSnapshot = {
  atBottom: boolean;
  atTop: boolean;
};

type TDeltaWithData = TDelta & {
  added: (ISortableModel & { data: any })[];
};
type ISortableModelWithData = ISortableModel & { data: any };

export {
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
  TDeltaWithData,
  ISortableModelWithData,
};
