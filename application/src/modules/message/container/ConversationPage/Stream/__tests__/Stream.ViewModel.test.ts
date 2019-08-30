/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-15 11:09:27
 * Copyright © RingCentral. All rights reserved.
 */

// / <reference path="../../../../../../../__tests__/types.d.ts" />
import React from 'react';
import { notificationCenter } from 'sdk/service';
import { StateService } from 'sdk/module/state';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import _ from 'lodash';
import {
  JError,
  ERROR_TYPES,
  ERROR_CODES_SERVER,
  JNetworkError,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import * as errorUtil from '@/utils/error';

import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import { StreamProps, StreamItemType } from '../types';
import { StreamViewModel } from '../Stream.ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { StreamController } from '../StreamController';
import { HistoryHandler } from '../HistoryHandler';
import { ConversationPostFocBuilder } from '@/store/handler/cache/ConversationPostFocBuilder';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import GroupStateModel from '@/store/models/GroupState';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { GroupState } from 'sdk/module/state/entity';
import * as utils from '@/store/utils';

jest.mock('sdk/dao');
jest.mock('sdk/module/item');
jest.mock('sdk/module/post');
jest.mock('sdk/module/group');
jest.mock('@/containers/Notification');
jest.mock('@/store/base/visibilityChangeEvent');

function streamProps(obj: any = {}): StreamProps {
  return {
    viewRef: React.createRef(),
    groupId: obj.groupId || 1,
    jumpToPostId: obj.jumpToPostId || undefined,
    refresh: () => {},
    updateConversationStatus: () => {},
  };
}

function setup(obj?: any) {
  const {
    currentPosts = [],
    postsNewerThanAnchor = [],
    postsOlderThanAnchor = [],
  } = obj;
  jest.spyOn(notificationCenter, 'on').mockImplementation();
  const dataProvider = { fetchData: jest.fn().mockName('fetchData()') };
  dataProvider.fetchData
    .mockResolvedValueOnce({ data: postsNewerThanAnchor, hasMore: true })
    .mockResolvedValueOnce({ data: postsOlderThanAnchor, hasMore: false });
  const listHandler = new FetchSortableDataListHandler<Post>(dataProvider, {
    isMatchFunc: () => true,
    transformFunc: (post: Post) => {
      return { id: post.id, sortValue: post.created_at, data: post };
    },
  });
  listHandler.upsert(currentPosts);
  listHandler.setHasMore(true, QUERY_DIRECTION.OLDER);
  listHandler.setHasMore(true, QUERY_DIRECTION.NEWER);
  jest
    .spyOn(ConversationPostFocBuilder, 'buildConversationPostFoc')
    .mockReturnValue(listHandler);
  const vm = new StreamViewModel(streamProps(obj));
  delete obj.groupId;
  Object.assign(vm, obj);
  return vm;
}

describe('StreamViewModel', () => {
  let itemService: ItemService;
  let postService: PostService;
  let stateService: StateService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    itemService = new ItemService();
    postService = new PostService();
    stateService = new StateService();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.ITEM_SERVICE) {
          return itemService;
        }

        if (serviceName === ServiceConfig.POST_SERVICE) {
          return postService;
        }

        if (serviceName === ServiceConfig.STATE_SERVICE) {
          return stateService;
        }

        return null;
      });

    spyOn(storeManager, 'dispatchUpdatedDataModels');
  });

  describe('loadInitialPosts()', () => {
    function setupMock({ props, getPostsByGroupIdData }: any) {
      jest.spyOn(utils, 'getSingleEntity').mockReturnValue([]);
      const vm = new StreamViewModel(props);
      jest.spyOn(vm, 'markAsRead').mockImplementation(() => {});
      postService.getPostsByGroupId.mockResolvedValue(getPostsByGroupIdData);
      return vm;
    }
    it('should load posts and update itemStore when fetch initial post', async () => {
      const vm = setupMock({
        props: streamProps(),
        getPostsByGroupIdData: {
          posts: [
            { id: 1, item_ids: [], created_at: 10000 },
            { id: 2, item_ids: [], created_at: 10001 },
            { id: 3, item_ids: [], created_at: 20010 },
          ],
          items: [{ id: 1 }],
        },
      });
      await vm.loadInitialPosts();
      expect(
        _(vm.items)
          .flatMap('value')
          .compact()
          .value(),
      ).toEqual([1, 2, 3]);
      expect(storeManager.dispatchUpdatedDataModels).toHaveBeenCalledWith(
        ENTITY_NAME.ITEM,
        [{ id: 1 }],
        false,
      );
    });
  });

  describe('getFirstUnreadPostByLoadAllUnread()', () => {
    function setupMock({
      groupId,
      groupState,
      currentPosts,
      readThroughPost,
      postsNewerThanAnchor,
      postsOlderThanAnchor,
    }: any) {
      const store = storeManager.getEntityMapStore(
        ENTITY_NAME.GROUP_STATE,
      ) as MultiEntityMapStore<GroupState, GroupStateModel>;
      store.set(groupState);
      postService.getById.mockResolvedValue(readThroughPost);
      postService.getUnreadPostsByGroupId.mockResolvedValue({
        posts: postsNewerThanAnchor,
        items: [],
        hasMore: false,
      });
      postService.getPostsByGroupId.mockResolvedValue({
        posts: postsOlderThanAnchor,
        items: [],
        hasMore: false,
      });
      const dataProvider = { fetchData: jest.fn().mockName('fetchData()') };
      const listHandler = new FetchSortableDataListHandler<Post>(dataProvider, {
        isMatchFunc: () => true,
        transformFunc: (post: Post) => {
          return { id: post.id, sortValue: post.created_at, data: post };
        },
      });
      listHandler.setHasMore(true, QUERY_DIRECTION.OLDER);
      listHandler.setHasMore(false, QUERY_DIRECTION.NEWER);
      jest.spyOn(listHandler, 'fetchDataByAnchor');
      jest
        .spyOn(ConversationPostFocBuilder, 'buildConversationPostFoc')
        .mockReturnValue(listHandler);

      const historyHandler = new HistoryHandler();
      historyHandler.update(groupState, _.map(currentPosts, post => post.id));

      const streamController = new StreamController(groupId, historyHandler, 1);
      streamController.disableNewMessageSep();
      listHandler.upsert(currentPosts);
      streamController.enableNewMessageSep();

      const vm = setup({
        _streamController: streamController,
        _historyHandler: historyHandler,
      });

      return { vm, historyHandler, streamController };
    }

    it('should load posts and return firstUnreadPostId', async () => {
      const readThroughPost = { id: 4, created_at: 104, creator_id: 1 };
      const postsOlderThanAnchor = [
        { id: 1, created_at: 101, creator_id: 1 },
        { id: 2, created_at: 102, creator_id: 1 },
        { id: 3, created_at: 103, creator_id: 1 },
        { id: 4, created_at: 104, creator_id: 1 },
      ];
      const postsNewerThanAnchor = [
        { id: 3, created_at: 103, creator_id: 1 },
        { id: 4, created_at: 104, creator_id: 1 },
        { id: 5, created_at: 105, creator_id: 1 },
        { id: 6, created_at: 106, creator_id: 1 },
        { id: 7, created_at: 107, creator_id: 1 },
        { id: 8, created_at: 108, creator_id: 1 },
      ];
      const { vm } = setupMock({
        postsNewerThanAnchor,
        readThroughPost,
        groupState: { unreadCount: 4, readThrough: readThroughPost.id },
        currentPosts: [{ id: 9, created_at: 109, creator_id: 1 }],
      });
      const firstUnreadPostId = await vm.getFirstUnreadPostByLoadAllUnread();

      expect(vm.postIds).toEqual([3, 4, 5, 6, 7, 8, 9]);
      expect(firstUnreadPostId).toBe(5);
    });

    it('should return first unread post id when it is already in current posts', async () => {
      const readThroughPost = { id: 4, created_at: 104, creator_id: 1 };

      const { vm, historyHandler } = setupMock({
        groupId: 1,
        readThroughPost,
        groupState: { id: 1, unreadCount: 4, readThrough: readThroughPost.id },
        currentPosts: [
          { id: 1, created_at: 101, creator_id: 1 },
          { id: 2, created_at: 102, creator_id: 1 },
          { id: 3, created_at: 103, creator_id: 1 },
          { id: 4, created_at: 104, creator_id: 1 },
          { id: 5, created_at: 105, creator_id: 1 },
          { id: 6, created_at: 106, creator_id: 1 },
          { id: 7, created_at: 107, creator_id: 1 },
          { id: 8, created_at: 108, creator_id: 1 },
        ],
      });
      jest.spyOn(historyHandler, 'getFirstUnreadPostId').mockReturnValue(5);
      const firstUnreadPostId = await vm.getFirstUnreadPostByLoadAllUnread();

      expect(firstUnreadPostId).toBe(5);
    });
  });

  describe('dispose()', () => {
    it('should dispose streamController', () => {
      const vm = setup({ _streamController: { dispose: jest.fn() } });
      vm.dispose();
      expect(vm._streamController.dispose).toHaveBeenCalled();
    });
  });

  describe('notEmpty', () => {
    function setupMockNoEmpty(props: { hasMoreUp: boolean; id?: number }) {
      const vm = new StreamViewModel(streamProps());

      Object.assign(vm, {
        _streamController: {
          hasMore: (direction: QUERY_DIRECTION) => {
            return props.hasMoreUp;
          },

          items: props.id
            ? [{ id: props.id, value: [props.id], type: StreamItemType.POST }]
            : [],
        },
      });
      return vm;
    }
    it('should be true when user has loaded messages  [JPT-478]', () => {
      const vm = setupMockNoEmpty({ hasMoreUp: false, id: 1 });
      expect(vm.notEmpty).toBe(true);
    });

    it('should be true when user has more unloaded messages  [JPT-478]', () => {
      const vm = setupMockNoEmpty({ hasMoreUp: true, id: 1 });
      expect(vm.notEmpty).toBe(true);
    });

    it('should be false when user has no more messages and no loaded messages  [JPT-478]', () => {
      const vm = setupMockNoEmpty({ hasMoreUp: false });
      expect(vm.notEmpty).toBe(false);
    });
  });

  describe('clearHistoryUnread()', () => {
    it('should clear historyHandler', () => {
      const mockClear = jest.fn();
      const vm = setup({ _historyHandler: { clear: mockClear } });
      vm.clearHistoryUnread();

      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateHistoryHandler()', () => {
    it('should update historyHandler with arguments', () => {
      const mockUpdate = jest.fn();
      const postIds = [Math.random(), Math.random()];
      const vm = setup({
        _historyHandler: { update: mockUpdate },
        _streamController: {
          postIds,
          items: postIds.map(i => ({
            id: i,
            value: i,
            type: StreamItemType.POST,
          })),
        },
      });

      vm.updateHistoryHandler();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(vm._groupState, postIds);
    });
  });

  describe('updateIgnoredStatus()', () => {
    it('should call stateService.updateIgnoredStatus with arguments', () => {
      const spy = jest.spyOn(stateService, 'updateIgnoredStatus');
      const groupId = 123123;
      const vm = setup({ groupId });
      vm.updateIgnoredStatus(true);

      expect(spy).toHaveBeenCalledWith([groupId], true);

      spy.mockRestore();
    });
  });

  describe('markAsRead()', () => {
    it('should call storeManager.getGlobalStore().set with arguments', () => {
      const spy = jest.spyOn(stateService, 'updateReadStatus');
      const groupId = 123123;
      const vm = setup({ groupId });
      vm.markAsRead();

      expect(spy).toHaveBeenCalledWith(groupId, false, true);

      spy.mockRestore();
    });
  });

  describe('enableNewMessageSeparatorHandler()', () => {
    it('should enable newMessageSeparatorHandler', () => {
      const mockEnable = jest.fn();
      const vm = setup({
        _streamController: { enableNewMessageSep: mockEnable },
      });
      vm.enableNewMessageSeparatorHandler();

      expect(mockEnable).toHaveBeenCalledTimes(1);
    });
  });

  describe('disableNewMessageSeparatorHandler()', () => {
    it('should disable newMessageSeparatorHandler', () => {
      const mockDisable = jest.fn();
      const vm = setup({
        _streamController: { disableNewMessageSep: mockDisable },
      });

      vm.disableNewMessageSeparatorHandler();

      expect(mockDisable).toHaveBeenCalledTimes(1);
    });
  });

  describe('initialize()', () => {
    function localSetup() {
      const autorun = jest.fn();
      const globalStore = { set: jest.fn(), get: jest.fn() };
      const dispose = jest.fn();
      const oldValue = {
        jumpToPostId: 121244,
        groupId: 123123123,
        _historyHandler: {},
        _streamController: { dispose },
        _initialized: true,
      };
      const vm = setup({
        autorun,
        ...oldValue,
      });

      return { vm, globalStore, autorun, dispose, oldValue };
    }

    it('should set/get global store value', () => {
      const { globalStore, vm } = localSetup();
      const spy = jest
        .spyOn(storeManager, 'getGlobalStore')
        .mockImplementation(() => globalStore);
      vm.initialize(12);

      expect(globalStore.set).toHaveBeenCalledWith(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
      expect(globalStore.get).toHaveBeenCalledWith(GLOBAL_KEYS.JUMP_TO_POST_ID);
      spy.mockRestore();
    });

    // This should be removed in future since sync item mustn't be initiated in stream.
    it('should sync group items when switch conversation', () => {
      const { vm } = localSetup();
      vm.initialize(12);
      expect(itemService.requestSyncGroupItems).toHaveBeenCalled();
    });
  });

  describe('loadPrevPosts()', () => {
    it('should get [] when hasMore is false', async () => {
      const hasMore = jest.fn(() => false);
      const fetchData = jest.fn(() => Promise.resolve([]));
      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      const posts = await vm.loadPrevPosts();
      expect(hasMore).toHaveBeenCalledWith(QUERY_DIRECTION.OLDER);
      expect(fetchData).not.toHaveBeenCalled();
      expect(posts).toEqual([]);
    });

    it('should get data when hasMore is true', async () => {
      const data = [Math.random()];
      const fetchData = jest.fn(() => Promise.resolve(data));
      const hasMore = jest.fn(() => true);
      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      const posts = await vm.loadPrevPosts();
      expect(fetchData).toHaveBeenCalledWith(QUERY_DIRECTION.OLDER, undefined);
      expect(posts).toEqual(data);
    });

    it('User manually loading older messages (by scrolling down) in Conversation page failed due to unexpected backend error [JPT-1803]', async () => {
      const fetchData = jest.fn(() =>
        Promise.reject(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.GENERAL,
            'Backend error',
          ),
        ),
      );
      const hasMore = jest.fn(() => true);

      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      await vm.loadPrevPosts();

      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        autoHideDuration: 3000,
        message: 'message.prompt.notAbleToLoadOlderMessagesForServerIssue',
        messageAlign: ToastMessageAlign.LEFT,
        type: ToastType.ERROR,
      });
    });

    it('User manually loading older messages (by scrolling down) in Conversation page failed due to network disconnection [JPT-1804]', async () => {
      const fetchData = jest.fn(() =>
        Promise.reject(
          new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK'),
        ),
      );
      const hasMore = jest.fn(() => true);

      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      await vm.loadPrevPosts();

      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        autoHideDuration: 3000,
        message: 'message.prompt.notAbleToLoadOlderMessagesForNetworkIssue',
        messageAlign: ToastMessageAlign.LEFT,
        type: ToastType.ERROR,
      });
    });

    it('should use generalErrorHandler if error is not from backend or network error', async () => {
      const fetchData = jest.fn(() => Promise.reject(new Error()));
      const hasMore = jest.fn(() => true);
      jest.spyOn(errorUtil, 'generalErrorHandler');

      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      try {
        await vm.loadPrevPosts();
      } catch {}

      expect(errorUtil.generalErrorHandler).toHaveBeenCalled();
    });
  });

  describe('loadNextPosts()', () => {
    it('should get [] when hasMore is false', async () => {
      const hasMore = jest.fn(() => false);
      const fetchData = jest.fn(() => Promise.resolve([]));
      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      const posts = await vm.loadNextPosts();

      expect(hasMore).toHaveBeenCalledWith(QUERY_DIRECTION.NEWER);
      expect(fetchData).not.toHaveBeenCalled();
      expect(posts).toEqual([]);
    });

    it('should get data when hasMore is true', async () => {
      const data = [Math.random()];
      const fetchData = jest.fn(() => Promise.resolve(data));
      const hasMore = jest.fn(() => true);
      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      const posts = await vm.loadNextPosts();
      expect(fetchData).toHaveBeenCalledWith(QUERY_DIRECTION.NEWER, undefined);
      expect(posts).toEqual(data);
    });

    it('should show error toast when server throw error while scroll down [JPT-695]', async () => {
      const fetchData = jest.fn(() =>
        Promise.reject(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.GENERAL,
            'Backend error',
          ),
        ),
      );
      const hasMore = jest.fn().mockReturnValue(true);

      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });

      try {
        await vm.loadNextPosts();
      } catch (error) {}

      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        autoHideDuration: 3000,
        message: 'message.prompt.SorryWeWereNotAbleToLoadNewerMessages',
        messageAlign: ToastMessageAlign.LEFT,
        type: ToastType.ERROR,
      });
    });

    it('should not show toast multiple times if calling error catched frequently', async () => {
      const fetchData = jest.fn(() =>
        Promise.reject(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.GENERAL,
            'Backend error',
          ),
        ),
      );
      const hasMore = jest.fn().mockReturnValue(true);

      const vm = setup({
        _streamController: {
          hasMore,
          fetchData,
        },
      });
      setTimeout(async () => {
        await vm.loadNextPosts();
        await vm.loadNextPosts();
        await vm.loadNextPosts();
        expect(Notification.flashToast).toHaveBeenCalledTimes(1);
      }, 1000);
    });
  });

  describe('findNewMessageSeparatorIndex()', () => {
    it('should return index of new message separator', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.NEW_MSG_SEPARATOR },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
          ],
        },
      });

      expect(vm.findNewMessageSeparatorIndex()).toBe(2);
    });

    it('should return -1 if no new message separator ', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
          ],
        },
      });

      expect(vm.findNewMessageSeparatorIndex()).toBe(-1);
    });
  });

  describe('hasNewMessageSeparator()', () => {
    it('should be true if there is a new message separator', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.NEW_MSG_SEPARATOR },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
          ],
        },
      });

      expect(vm.hasNewMessageSeparator()).toBeTruthy();
    });

    it('should be false if no any new message separator', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
            { type: StreamItemType.POST },
          ],
        },
      });

      expect(vm.hasNewMessageSeparator()).toBeFalsy();
    });
  });

  describe('findPostIndex()', () => {
    it('should return index of the post', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST, value: 10 },
            { type: StreamItemType.POST, value: 11 },
            { type: StreamItemType.POST, value: 12 },
            { type: StreamItemType.POST, value: 13 },
          ],
        },
      });

      expect(vm.findPostIndex(11)).toBe(1);
    });

    it('should return -1 if the post no existed', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST, value: 10 },
            { type: StreamItemType.POST, value: 11 },
            { type: StreamItemType.POST, value: 12 },
            { type: StreamItemType.POST, value: 13 },
          ],
        },
      });

      expect(vm.findPostIndex(14)).toBe(-1);
    });

    it('should return -1 if the postId is undefined', () => {
      const vm = setup({
        _streamController: {
          items: [
            { type: StreamItemType.POST, value: 10 },
            { type: StreamItemType.POST, value: 11 },
            { type: StreamItemType.POST, value: 12 },
            { type: StreamItemType.POST, value: 13 },
          ],
        },
      });

      expect(vm.findPostIndex()).toBe(-1);
    });
  });
});
