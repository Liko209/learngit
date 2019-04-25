/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-13 19:47:59
 * Copyright © RingCentral. All rights reserved.
 */
import i18next from 'i18next';
import React from 'react';
import { LoadingMorePlugin } from '@/plugins';
import GroupStateModel from '@/store/models/GroupState';

const baseProps = {
  i18n: {} as i18next.i18n,
  tReady: true,
  postIds: [],
  t: (): any => 'a',
  items: [],
  groupId: 1,
  viewRef: React.createRef(),
  setRowVisible: jest.fn().mockName('setRowVisible'),
  markAsRead: jest.fn().mockName('markAsRead'),
  atBottom: jest.fn().mockName('atBottom'),
  atTop: jest.fn().mockName('atTop'),
  enableNewMessageSeparatorHandler: jest
    .fn()
    .mockName('enableNewMessageSeparatorHandler'),
  plugins: {
    loadingMorePlugin: new LoadingMorePlugin(),
  },
  loadMore: jest.fn().mockName('loadMore'),
  hasMore: jest.fn().mockName('hasMore'),
  notEmpty: true,
  historyGroupState: {} as GroupStateModel,
  historyUnreadCount: 10,
  historyReadThrough: 0,
  hasHistoryUnread: false,
  firstHistoryUnreadInPage: false,
  clearHistoryUnread: jest.fn().mockName('setHasUnread'),
  getFirstUnreadPostByLoadAllUnread: jest
    .fn()
    .mockName('getFirstUnreadPostByLoadAllUnread'),
  jumpToPostId: 0,
  loadInitialPosts: async () => {},
  updateHistoryHandler: () => {},
  mostRecentPostId: 0,
  resetJumpToPostId: () => null,
  resetAll: (id: number) => {},
};

export { baseProps };
