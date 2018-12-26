/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-15 11:09:27
 * Copyright © RingCentral. All rights reserved.
 */
import { PostService, StateService } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import { StreamViewModel } from '../Stream.ViewModel';
import { StreamItemType } from '../types';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';

jest.mock('sdk/service/post');
jest.mock('@/store');
jest.mock('../../../../store/base/visibilityChangeEvent');

function setup(obj?: any) {
  const vm = new StreamViewModel();
  Object.assign(vm, obj);
  return vm;
}

describe('StreamViewModel', () => {
  let postService: PostService;

  beforeEach(() => {
    jest.clearAllMocks();
    postService = new PostService();
    PostService.getInstance = jest.fn().mockReturnValue(postService);
    spyOn(storeManager, 'dispatchUpdatedDataModels');
  });

  describe('loadInitialPosts()', () => {
    function setup(obj: any) {
      const vm = new StreamViewModel();
      jest.spyOn(vm, 'markAsRead').mockImplementation(() => {});
      obj.props && vm.onReceiveProps(obj.props);
      return vm;
    }

    it('should load posts and update itemStore when fetch initial post', async () => {
      const vm = setup({
        props: { groupId: 1 },
      });
      (postService.getPostsByGroupId as jest.Mock).mockResolvedValue({
        posts: [
          { id: 1, item_ids: [], created_at: Date.now() + 1 },
          { id: 2, item_ids: [], created_at: Date.now() + 2 },
          { id: 3, item_ids: [], create_at: Date.now() + 3 },
        ],
        items: [{ id: 1 }],
      });
      await vm.loadInitialPosts();
      expect(vm.items).toEqual([
        { type: StreamItemType.POST, value: 1 },
        { type: StreamItemType.POST, value: 2 },
        { type: StreamItemType.POST, value: 3 },
      ]);
      expect(storeManager.dispatchUpdatedDataModels).toBeCalledWith(
        ENTITY_NAME.ITEM,
        [{ id: 1 }],
      );
    });
  });

  describe('loadPostUntilFirstUnread()', () => {
    function setupLoadPostUntilFirstUnread(obj: any) {
      const vm = setup({
        _newMessageSeparatorHandler: {
          enable: jest.fn(),
        },
        _transformHandler: {
          hasMore: jest.fn(),
        },
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

  describe('onReceiveProps()', () => {
    it('should do nothing when groupId not change', () => {
      const vm = setup({
        groupId: 1,
      });
      jest.spyOn(vm, 'dispose');
      vm.onReceiveProps({ groupId: 1 } as any);
      expect(vm.dispose).not.toHaveBeenCalled();
    });
  });

  describe('dispose()', () => {
    it('should dispose transformHandler', () => {
      const _transformHandler = {
        dispose: jest.fn().mockName('vm._transformHandler.dispose'),
      };
      const vm = setup({ _transformHandler });

      vm.dispose();

      expect(_transformHandler.dispose).toHaveBeenCalled();
    });
  });

  describe('notEmpty', () => {
    function setup(props: { hasMoreUp: boolean; items: any[] }) {
      const vm = new StreamViewModel();
      Object.assign(vm, {
        _transformHandler: { hasMore: () => props.hasMoreUp },
        items: props.items,
      });
      return vm;
    }
    it('should be true when user has loaded messages  [JPT-478]', () => {
      const vm = setup({ hasMoreUp: false, items: [1] });
      expect(vm.notEmpty).toBe(true);
    });

    it('should be true when user has more unloaded messages  [JPT-478]', () => {
      const vm = setup({ hasMoreUp: true, items: [] });
      expect(vm.notEmpty).toBe(true);
    });

    it('should be false when user has no more messages and no loaded messages  [JPT-478]', () => {
      const vm = setup({ hasMoreUp: false, items: [] });
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
        postIds,
        _historyHandler: { update: mockUpdate },
      });
      Object.defineProperty(vm, '_groupState', { value: groupState });
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
      const vm = setup({ _newMessageSeparatorHandler: { enable: mockEnable } });
      vm.enableNewMessageSeparatorHandler();

      expect(mockEnable).toBeCalledTimes(1);
    });
  });

  describe('disableNewMessageSeparatorHandler()', () => {
    it('should disable newMessageSeparatorHandler', () => {
      const mockDisable = jest.fn();
      const vm = setup({
        _newMessageSeparatorHandler: { disable: mockDisable },
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
        _newMessageSeparatorHandler: {},
        _transformHandler: { dispose },
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

    it('should reset property', () => {
      const { vm, oldValue } = localSetup();
      const groupId = 235;

      expect(vm.jumpToPostId).toBe(oldValue.jumpToPostId);
      expect(vm.groupId).toBe(oldValue.groupId);
      expect(vm._initialized).toBe(true);

      vm.initialize(groupId);

      expect(vm.groupId).toBe(groupId);
      expect(vm.jumpToPostId).not.toBe(oldValue.jumpToPostId);
      expect(vm._historyHandler).not.toBe(oldValue._historyHandler);
      expect(vm._newMessageSeparatorHandler).not.toBe(
        oldValue._newMessageSeparatorHandler,
      );
      expect(vm._transformHandler).not.toBe(oldValue._transformHandler);
      expect(vm._initialized).toBe(false);
    });

    it('should call autorun', () => {
      const { vm, autorun } = localSetup();
      vm.initialize(11);

      expect(autorun).toBeCalledTimes(3);
    });
  });

  describe('loadPrevPosts()', () => {
    it('should get [] when hasMore is false', async () => {
      const hasMore = jest.fn(() => false);
      const fetchData = jest.fn(() => Promise.resolve([]));
      const vm = setup({
        _transformHandler: {
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
        _transformHandler: {
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
        _transformHandler: {
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
        _transformHandler: {
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
    let _newMessageSeparatorHandler: any;
    const globalStore = {
      set: jest.fn(),
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
      _newMessageSeparatorHandler = {
        disable: jest.fn(),
        enable: jest.fn(),
      };
      return setup({
        _newMessageSeparatorHandler,
        _initialized: initialized,
        ...args,
      });
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
        expect(_newMessageSeparatorHandler.disable).toBeCalled();
      }

      function showUMIAndEnableMessageHandler() {
        expect(globalStore.set).toBeCalledWith(
          GLOBAL_KEYS.SHOULD_SHOW_UMI,
          true,
        );
        expect(_newMessageSeparatorHandler.enable).toBeCalled();
      }

      it('should disable _newMessageSeparatorHandler when at bottom and document has focus', () => {
        mockStoreManager();
        mockDocumentFocus(true);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(atBottomEvent);

        hideUMIAndDisableMessageHandler();
      });

      it('should enable _newMessageSeparatorHandler when at bottom and document without focus', () => {
        mockStoreManager();
        mockDocumentFocus(false);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(atBottomEvent);

        showUMIAndEnableMessageHandler();
      });

      it('should enable _newMessageSeparatorHandler when not at bottom and document has focus', () => {
        mockStoreManager();
        mockDocumentFocus(true);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(notAtBottomEvent);

        showUMIAndEnableMessageHandler();
      });

      it('should enable _newMessageSeparatorHandler when not at bottom and document without focus', () => {
        mockStoreManager();
        mockDocumentFocus(false);
        const vm = localSetup({});
        vm.handleNewMessageSeparatorState(notAtBottomEvent);

        showUMIAndEnableMessageHandler();
      });
    });

    describe('when viewModel is not initialized', () => {
      it('should enable _newMessageSeparatorHandler when at bottom and document has focus', () => {
        mockStoreManager();
        mockDocumentFocus(true);
        const vm = localSetup({}, false);
        vm.handleNewMessageSeparatorState(atBottomEvent);

        expect(_newMessageSeparatorHandler.enable).toBeCalled();
      });
    });

    jest.restoreAllMocks();
  });
});
