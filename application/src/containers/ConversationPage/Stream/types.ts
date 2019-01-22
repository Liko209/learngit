/*
 * @Author: Andy Hu
 * @Date: 2018-11-13 18:05:16
 * Copyright © RingCentral. All rights reserved.
 */
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
  GROUPED_POSTS = 'GROUPED_POSTS',
  DATE_SEPARATOR = 'DATE_SEPARATOR',
  NEW_MSG_SEPARATOR = 'NEW_MSG_SEPARATOR',
}

type BaseElement = {
  type: StreamItemType;
  value: number;
  meta?: any;
};

type StreamItem = {
  type: StreamItemType;
  value: any;
  meta?: any;
};

type StreamProps = {
  groupId: number;
  viewRef: React.RefObject<any>;
};

type StreamViewProps = {
  mostRecentPostId: number;
  firstHistoryUnreadInPage: boolean;
  groupId: number;
  postIds: number[];
  jumpToPostId: number;
  items: StreamItem[];
  hasMoreUp: boolean;
  hasMoreDown: boolean;
  notEmpty: boolean;
  setRowVisible: (n: number) => void;
  markAsRead: () => void;
  loadInitialPosts: () => Promise<void>;
  atBottom: () => boolean;
  atTop: () => boolean;
  enableNewMessageSeparatorHandler: () => void;
  loadPostUntilFirstUnread: () => Promise<number | undefined>;
  updateHistoryHandler: () => void;
  hasHistoryUnread: boolean;
  clearHistoryUnread: () => void;
  historyUnreadCount: number;
  historyReadThrough: number;
  firstHistoryUnreadPostId?: number;
  loadInitialPostsError?: Error;
  loading?: boolean;
};

type StreamSnapshot = {
  atBottom: boolean;
  atTop: boolean;
};

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
};
