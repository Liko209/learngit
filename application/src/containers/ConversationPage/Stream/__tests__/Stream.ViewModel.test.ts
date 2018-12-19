/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-15 11:09:27
 * Copyright © RingCentral. All rights reserved.
 */
import { PostService, ItemService } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import { StreamViewModel } from '../Stream.ViewModel';
import { StreamItemType } from '../types';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { Post, Item } from 'sdk/models';

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
          { id: 1, item_ids: [] },
          { id: 2, item_ids: [] },
          { id: 3, item_ids: [] },
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
      vm.onReceiveProps({ groupId: 1 });
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
      const mockMarkAsRead = jest.fn();
      const groupId = Math.random();
      const mockGlobalStore = {
        set: jest.fn(),
      };
      const vm = setup({
        groupId,
        _stateService: {
          markAsRead: mockMarkAsRead,
        },
      });
      const spy = jest
        .spyOn(storeManager, 'getGlobalStore')
        .mockImplementation(() => mockGlobalStore);

      vm.markAsRead();
      expect(mockMarkAsRead).toBeCalledTimes(1);
      expect(mockMarkAsRead).toBeCalledWith(groupId);
      expect(mockGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.SHOULD_SHOW_UMI,
        false,
      );
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

  describe('resetJumpToPostId()', () => {
    function resetJumpToPostIdSetup() {
      const globalStore = { set: jest.fn() };
      const vm = setup({ jumpToPostId: 5 });
      return { globalStore, vm };
    }

    it('should set global store', () => {
      const { globalStore, vm } = resetJumpToPostIdSetup();
      const spy = jest
        .spyOn(storeManager, 'getGlobalStore')
        .mockImplementation(() => globalStore);

      vm.resetJumpToPostId();

      expect(globalStore.set).toBeCalledWith(GLOBAL_KEYS.JUMP_TO_POST_ID, 0);

      spy.mockRestore();
    });

    it('should set jumpToPostId to 0', () => {
      const { vm } = resetJumpToPostIdSetup();
      vm.resetJumpToPostId();

      expect(vm.jumpToPostId).toBe(0);
    });
  });

  describe('resetAll()', () => {
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
      vm.resetAll(12);

      expect(globalStore.set).toBeCalledWith(
        GLOBAL_KEYS.SHOULD_SHOW_UMI,
        false,
      );
      expect(globalStore.get).toBeCalledWith(GLOBAL_KEYS.JUMP_TO_POST_ID);

      spy.mockRestore();
    });

    it('should reset property', () => {
      const { vm, oldValue } = localSetup();
      const groupId = 235;

      expect(vm.jumpToPostId).toBe(oldValue.jumpToPostId);
      expect(vm.groupId).toBe(oldValue.groupId);
      expect(vm._initialized).toBe(true);
      vm.resetAll(groupId);

      expect(vm.groupId).toBe(groupId);
      expect(vm.jumpToPostId).not.toBe(oldValue.jumpToPostId);
      expect(vm._historyHandler).not.toBe(oldValue._historyHandler);
      expect(vm._newMessageSeparatorHandler).not.toBe(
        oldValue._newMessageSeparatorHandler,
      );
      expect(vm._transformHandler).not.toBe(oldValue._transformHandler);
      expect(vm._initialized).toBe(false);
    });

    it('should call dispose', () => {
      const { vm, dispose } = localSetup();
      vm.resetAll(11);

      expect(dispose).toBeCalled();
    });

    it('should call autorun', () => {
      const { vm, autorun } = localSetup();
      vm.resetAll(11);

      expect(autorun).toBeCalledTimes(3);
    });
  });

  describe('_prepareAllData', () => {
    const posts = [{ item_ids: [1, 2, 3] }, { item_ids: [4, 5] }] as Post[];
    const ids = [1, 2, 3, 4, 5];
    let itemService: ItemService;

    beforeEach(() => {
      itemService = new ItemService();
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
    });

    it('should call dispatchUpdatedDataModels on storeManager with certain arguments', async () => {
      const dispatchUpdatedDataModels = jest.fn();
      itemService.getById = jest.fn(id => Promise.resolve(id));
      const spy = jest
        .spyOn(storeManager, 'dispatchUpdatedDataModels')
        .mockImplementation((...args) => dispatchUpdatedDataModels(args));
      const vm = setup();

      await vm._prepareAllData(posts);

      expect(itemService.getById).toBeCalled();
      expect(spy).toBeCalledWith(ENTITY_NAME.ITEM, ids);

      spy.mockRestore();
    });
  });
});
