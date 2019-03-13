/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-15 11:09:27
 * Copyright © RingCentral. All rights reserved.
 */

/// <reference path="../../../../../__tests__/types.d.ts" />
import React from 'react';
import { notificationCenter } from 'sdk/service';
import { StateService } from 'sdk/module/state';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import _ from 'lodash';
import { JError, ERROR_TYPES, ERROR_CODES_SERVER } from 'sdk/error';
import { Notification } from '@/containers/Notification';
import * as errorUtil from '@/utils/error';

import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ItemService } from 'sdk/module/item';
import * as SCM from '../StreamController';
import { PostService } from 'sdk/module/post';
import { StreamProps, StreamItemType } from '../types';
import { StreamViewModel } from '../Stream.ViewModel';

jest.mock('sdk/module/item');
jest.mock('sdk/module/post');
jest.mock('../../../../store/base/visibilityChangeEvent');

const postService = new PostService();

function setup(obj?: any) {
  jest.spyOn(notificationCenter, 'on').mockImplementation();
  const vm = new StreamViewModel({
    viewRef: React.createRef(),
    groupId: obj.groupId || 1,
  });
  delete obj.groupId;
  Object.assign(vm, obj);
  return vm;
}

describe('StreamViewModel', () => {
  let itemService: ItemService;
  const streamController = {
    dispose: jest.fn(),
    hasMore: jest.fn(),
    enableNewMessageSep: jest.fn(),
    disableNewMessageSep: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    itemService = new ItemService();
    PostService.getInstance = jest.fn().mockReturnValue(postService);
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
    spyOn(storeManager, 'dispatchUpdatedDataModels');
  });

  describe('loadInitialPosts()', () => {
    function setup(obj: any) {
      const vm = new StreamViewModel(obj.props);
      jest.spyOn(vm, 'markAsRead').mockImplementation(() => {});
      return vm;
    }

    it('should load posts and update itemStore when fetch initial post', async () => {
      const vm = setup({
        props: { groupId: 1 },
      });
      postService.getPostsByGroupId.mockResolvedValue({
        posts: [
          { id: 1, item_ids: [], created_at: 10000 },
          { id: 2, item_ids: [], created_at: 10001 },
          { id: 3, item_ids: [], created_at: 20010 },
        ],
        items: [{ id: 1 }],
      });
      await vm.loadInitialPosts();
      expect(
        _(vm.items)
          .flatMap('value')
          .compact()
          .value(),
      ).toEqual([1, 2, 3]);
      expect(storeManager.dispatchUpdatedDataModels).toBeCalledWith(
        ENTITY_NAME.ITEM,
        [{ id: 1 }],
      );
    });
  });

  describe('loadPostUntilFirstUnread()', () => {
    function setupLoadPostUntilFirstUnread(obj: any) {
      const vm = setup({
        streamController,
        _historyHandler: {
          getDistanceToFirstUnread: jest
            .fn()
            .mockReturnValue(obj.distanceToFirstUnread),
          getFirstUnreadPostId: jest.fn(),
        },
      });

      const loadPosts = jest
        .spyOn<StreamViewModel, any>(vm, '_loadPosts')
        .mockImplementation(() => {});

      return { vm, loadPosts };
    }

    it('should load 6 posts when distance to first unread is 5', async () => {
      const { vm, loadPosts } = setupLoadPostUntilFirstUnread({
        distanceToFirstUnread: 5,
      });
      await vm.loadPostUntilFirstUnread();
      expect(loadPosts).toHaveBeenCalledWith(QUERY_DIRECTION.OLDER, 6);
    });

    it('should not load posts when distance to first unread <= 0', async () => {
      const { vm, loadPosts } = setupLoadPostUntilFirstUnread({
        distanceToFirstUnread: -1,
      });

      await vm.loadPostUntilFirstUnread();

      expect(loadPosts).not.toHaveBeenCalled();
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
    function setup(props: { hasMoreUp: boolean; id?: number }) {
      const vm = new StreamViewModel({
        groupId: 1,
      } as StreamProps);

      Object.assign(vm, {
        _streamController: {
          hasMoreUp: props.hasMoreUp,
          items: props.id
            ? [{ id: props.id, value: [props.id], type: StreamItemType.POST }]
            : [],
        },
      });
      return vm;
    }
    it('should be true when user has loaded messages  [JPT-478]', () => {
      const vm = setup({ hasMoreUp: false, id: 1 });
      expect(vm.notEmpty).toBe(true);
    });

    it('should be true when user has more unloaded messages  [JPT-478]', () => {
      const vm = setup({ hasMoreUp: true, id: 1 });
      expect(vm.notEmpty).toBe(true);
    });

    it('should be false when user has no more messages and no loaded messages  [JPT-478]', () => {
      const vm = setup({ hasMoreUp: false });
      expect(vm.notEmpty).toBe(false);
    });
  });

  describe('clearHistoryUnread()', () => {
    it('should clear historyHandler', () => {
      const mockClear = jest.fn();
      const vm = setup({ _historyHandler: { clear: mockClear } });
      vm.clearHistoryUnread();

      expect(mockClear).toBeCalledTimes(1);
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
      expect(mockUpdate).toBeCalledTimes(1);
      expect(mockUpdate).toBeCalledWith(vm._groupState, postIds);
    });
  });

  describe('markAsRead()', () => {
    it('should call storeManager.getGlobalStore().set with arguments', () => {
      const stateService = new StateService();
      const spy = jest.spyOn(stateService, 'updateReadStatus');
      StateService.getInstance = jest.fn().mockReturnValue(stateService);
      const groupId = 123123;
      const vm = setup({ groupId });
      vm.markAsRead();

      expect(spy).toBeCalledWith(groupId, false, true);

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

      expect(mockEnable).toBeCalledTimes(1);
    });
  });

  describe('disableNewMessageSeparatorHandler()', () => {
    it('should disable newMessageSeparatorHandler', () => {
      const mockDisable = jest.fn();
      const vm = setup({
        _streamController: { disableNewMessageSep: mockDisable },
      });

      vm.disableNewMessageSeparatorHandler();

      expect(mockDisable).toBeCalledTimes(1);
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

      expect(globalStore.set).toBeCalledWith(
        GLOBAL_KEYS.SHOULD_SHOW_UMI,
        false,
      );
      expect(globalStore.set).toBeCalledWith(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);
      expect(globalStore.get).toBeCalledWith(GLOBAL_KEYS.JUMP_TO_POST_ID);
      spy.mockRestore();
    });

    // This should be removed in future since sync item mustn't be initiated in stream.
    it('should sync group items when switch conversation', () => {
      const { vm } = localSetup();
      vm.initialize(12);
      expect(itemService.requestSyncGroupItems).toBeCalled();
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
      expect(hasMore).toBeCalledWith(QUERY_DIRECTION.OLDER);
      expect(fetchData).not.toBeCalled();
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
      expect(fetchData).toBeCalledWith(QUERY_DIRECTION.OLDER, undefined);
      expect(posts).toEqual(data);
    });

    it('should show error toast when server throw error while scroll up [JPT-695]', async () => {
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

      Notification.flashToast = jest.fn();

      await vm.loadPrevPosts();

      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        message: 'message.prompt.SorryWeWereNotAbleToLoadOlderMessages',
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

      await vm.loadPrevPosts();

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

      expect(hasMore).toBeCalledWith(QUERY_DIRECTION.NEWER);
      expect(fetchData).not.toBeCalled();
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
      expect(fetchData).toBeCalledWith(QUERY_DIRECTION.NEWER, undefined);
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

      Notification.flashToast = jest.fn();

      await vm.loadNextPosts();

      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
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

      Notification.flashToast = jest.fn();

      await vm.loadNextPosts();
      await vm.loadNextPosts();
      await vm.loadNextPosts();

      expect(Notification.flashToast).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleNewMessageSeparatorState()', () => {
    let streamController: any;
    const globalStore = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue(1),
    };
    const atBottomEvent = {
      target: {
        scrollHeight: 0,
        scrollTop: 0,
        clientHeight: 0,
      },
    } as any;
    const notAtBottomEvent = {
      target: {
        scrollHeight: 10,
        scrollTop: 0,
        clientHeight: 0,
      },
    } as any;

    function mockStoreManager() {
      jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(globalStore);
    }

    function mockDocumentFocus(hasFocus: boolean) {
      jest.spyOn(document, 'hasFocus').mockReturnValue(hasFocus);
    }

    function localSetup(args: object, initialized: boolean = true) {
      jest.spyOn(SCM, 'StreamController').mockImplementation();
      streamController = {
        disableNewMessageSep: jest.fn(),
        enableNewMessageSep: jest.fn(),
        dispose: jest.fn(),
      };
      const vm = setup({
        _streamController: streamController,
        _initialized: initialized,
        ...args,
      });
      vm.dispose();
      return vm;
    }

    afterAll(() => {
      jest.restoreAllMocks();
    });

    describe('when viewModel is initialized', () => {
      function hideUMIAndDisableMessageHandler() {
        expect(globalStore.set).toBeCalledWith(
          GLOBAL_KEYS.SHOULD_SHOW_UMI,
          false,
        );
        expect(streamController.disableNewMessageSep).toBeCalled();
      }

      function showUMIAndEnableMessageHandler() {
        expect(globalStore.set).toBeCalledWith(
          GLOBAL_KEYS.SHOULD_SHOW_UMI,
          true,
        );
        expect(streamController.enableNewMessageSep).toBeCalled();
      }

      it('should disable newMessageSeparatorHandler when at bottom and document has focus', () => {
        mockStoreManager();
        mockDocumentFocus(true);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(atBottomEvent);
        hideUMIAndDisableMessageHandler();
      });

      it('should enable newMessageSeparatorHandler when at bottom and document without focus', () => {
        mockStoreManager();
        mockDocumentFocus(false);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(atBottomEvent);
        showUMIAndEnableMessageHandler();
      });

      it('should enable newMessageSeparatorHandler when not at bottom and document has focus', () => {
        mockStoreManager();
        mockDocumentFocus(true);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(notAtBottomEvent);
        showUMIAndEnableMessageHandler();
      });

      it('should enable newMessageSeparatorHandler when not at bottom and document without focus', () => {
        mockStoreManager();
        mockDocumentFocus(false);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(notAtBottomEvent);
        showUMIAndEnableMessageHandler();
      });
    });

    describe('when viewModel is not initialized', () => {
      it('should enable newMessageSeparatorHandler when at bottom and document has focus', () => {
        mockStoreManager();
        mockDocumentFocus(true);
        const vm = localSetup({}, false);
        vm.handleNewMessageSeparatorState(atBottomEvent);

        expect(streamController.enableNewMessageSep).toBeCalled();
      });
    });
    jest.restoreAllMocks();
  });
});
