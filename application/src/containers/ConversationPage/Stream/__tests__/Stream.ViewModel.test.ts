/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-15 11:09:27
 * Copyright © RingCentral. All rights reserved.
 */
import { PostService, StateService } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import { StreamViewModel } from '../Stream.ViewModel';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import _ from 'lodash';
import { id } from 'inversify';
import { errorHelper } from 'sdk/error';
import { Notification } from '@/containers/Notification';
import * as errorUtil from '@/utils/error';

import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ItemService } from 'sdk/module/item';
import * as SCM from '../StreamController';

jest.mock('sdk/module/item');
jest.mock('sdk/service/post');
jest.mock('@/store');
jest.mock('../../../../store/base/visibilityChangeEvent');

function setup(obj?: any) {
  const vm = new StreamViewModel({ groupId: obj.groupId || 1 });
  Object.assign(vm, obj);
  return vm;
}

describe.skip('StreamViewModel', () => {
  let postService: PostService;
  let itemService: ItemService;
  const streamController = {
    dispose: jest.fn(),
    hasMore: jest.fn(),
    enableNewMessageSep: jest.fn(),
    disableNewMessageSep: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    itemService = new ItemService();
    postService = new PostService();
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

    it.skip('should load posts and update itemStore when fetch initial post', async () => {
      const vm = setup({
        props: { groupId: 1 },
      });
      (postService.getPostsByGroupId as jest.Mock).mockResolvedValue({
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
      const vm = setup({ streamController: { dispose: jest.fn() } });
      vm.dispose();
      expect(vm.streamController.dispose).toHaveBeenCalled();
    });
  });

  describe('notEmpty', () => {
    function setup(props: { hasMoreUp: boolean; id?: number }) {
      const vm = new StreamViewModel({
        groupId: 1,
      });
      vm.streamController = {
        hasMoreUp: props.hasMoreUp,
        items: props.id ? [{ id: props.id, value: [props.id] }] : [],
      };

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
      const groupState = Math.random();
      const postIds = [Math.random(), Math.random()];
      const vm = setup({
        _historyHandler: { update: mockUpdate },
        streamController: {},
      });

      vm.streamController.postIds = postIds;
      Object.defineProperty(vm, '_groupState', {
        value: groupState,
      });
      vm.updateHistoryHandler();

      expect(mockUpdate).toBeCalledTimes(1);
      expect(mockUpdate).toBeCalledWith(groupState, postIds);
    });
  });

  describe('markAsRead()', () => {
    it('should call storeManager.getGlobalStore().set with arguments', () => {
      const stateService = new StateService();
      const spy = jest.spyOn(stateService, 'markAsRead');
      StateService.getInstance = jest.fn().mockReturnValue(stateService);
      const groupId = 123123;
      const vm = setup({ groupId });
      vm.markAsRead();

      expect(spy).toBeCalledWith(groupId);

      spy.mockRestore();
    });
  });

  describe('enableNewMessageSeparatorHandler()', () => {
    it('should enable newMessageSeparatorHandler', () => {
      const mockEnable = jest.fn();
      const vm = setup({
        streamController: { enableNewMessageSep: mockEnable },
      });
      vm.enableNewMessageSeparatorHandler();

      expect(mockEnable).toBeCalledTimes(1);
    });
  });

  describe('disableNewMessageSeparatorHandler()', () => {
    it('should disable newMessageSeparatorHandler', () => {
      const mockDisable = jest.fn();
      const vm = setup({
        streamController: { disableNewMessageSep: mockDisable },
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
        streamController: { dispose },
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
  });

  describe('loadPrevPosts()', () => {
    it('should get [] when hasMore is false', async () => {
      const hasMore = jest.fn(() => false);
      const fetchData = jest.fn(() => Promise.resolve([]));
      const vm = setup({
        streamController: {
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
        streamController: {
          hasMore,
          fetchData,
        },
      });

      const posts = await vm.loadPrevPosts();
      expect(fetchData).toBeCalledWith(QUERY_DIRECTION.OLDER, undefined);
      expect(posts).toEqual(data);
    });
  });

  describe('loadNextPosts()', () => {
    it('should get [] when hasMore is false', async () => {
      const hasMore = jest.fn(() => false);
      const fetchData = jest.fn(() => Promise.resolve([]));
      const vm = setup({
        streamController: {
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
        streamController: {
          hasMore,
          fetchData,
        },
      });

      const posts = await vm.loadNextPosts();
      expect(fetchData).toBeCalledWith(QUERY_DIRECTION.NEWER, undefined);
      expect(posts).toEqual(data);
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
        streamController,
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

describe.skip('fetchData()', () => {
  function setup() {
    const vm = new StreamViewModel({ groupId: 1 });
    return vm;
  }
  let vm;
  let postService;
  beforeEach(() => {
    postService = new PostService();
    PostService.getInstance = jest.fn().mockReturnValue(postService);
    vm = setup();
  });
  it('should show error toast when server throw error while scroll up [JPT-695]', async () => {
    jest.spyOn(vm.streamController, 'hasMore').mockReturnValueOnce(true);
    jest.spyOn(vm.streamController, 'fetchData');
    postService.getPostsByGroupId = jest
      .fn()
      .mockRejectedValueOnce(new Error());
    jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
    Notification.flashToast = jest.fn();
    await vm.loadPrevPosts();
    expect(vm.streamController.fetchData).toHaveBeenCalled();
    expect(Notification.flashToast).toHaveBeenCalledWith({
      dismissible: false,
      fullWidth: false,
      message: 'SorryWeWereNotAbleToLoadOlderMessages',
      messageAlign: ToastMessageAlign.LEFT,
      type: ToastType.ERROR,
    });
  });

  it('should show error toast when server throw error while scroll down [JPT-695]', async () => {
    jest.spyOn(vm.streamController, 'hasMore').mockReturnValueOnce(true);
    jest.spyOn(vm.streamController, 'fetchData');
    postService.getPostsByGroupId = jest
      .fn()
      .mockRejectedValueOnce(new Error());
    jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
    Notification.flashToast = jest.fn();
    await vm.loadNextPosts();
    expect(vm.streamController.fetchData).toHaveBeenCalled();
    expect(Notification.flashToast).toHaveBeenCalledWith({
      dismissible: false,
      fullWidth: false,
      message: 'SorryWeWereNotAbleToLoadNewerMessages',
      messageAlign: ToastMessageAlign.LEFT,
      type: ToastType.ERROR,
    });
  });

  it('should use generalErrorHandler if error is not from backend', async () => {
    jest.spyOn(vm.streamController, 'hasMore').mockReturnValueOnce(true);
    jest.spyOn(vm.streamController, 'fetchData');
    postService.getPostsByGroupId = jest
      .fn()
      .mockRejectedValueOnce(new Error());
    jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(false);
    jest.spyOn(errorUtil, 'generalErrorHandler');
    await vm.loadPrevPosts();
    expect(vm.streamController.fetchData).toHaveBeenCalled();
    expect(errorUtil.generalErrorHandler).toHaveBeenCalled();
  });
});
