/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-15 11:09:27
 * Copyright © RingCentral. All rights reserved.
 */
import { StreamViewModel } from '../Stream.ViewModel';
import { QUERY_DIRECTION } from 'sdk/dao';

jest.mock('../../../../store/base/visibilityChangeEvent');

function setup(obj?: any) {
  const vm = new StreamViewModel();
  Object.assign(vm, obj);
  return vm;
}

describe('StreamViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadInitialPosts()', () => {
    function setup(obj: any) {
      const vm = new StreamViewModel();
      jest.spyOn(vm, 'markAsRead').mockImplementation(() => {});
      jest
        .spyOn<StreamViewModel, any>(vm, '_loadPosts')
        .mockResolvedValue(obj.spy._loadPosts);
      obj.props && vm.onReceiveProps(obj.props);
      return vm;
    }

    it('should mark as read when loaded', async () => {
      const vm = setup({
        props: { groupId: 1 },
        spy: {
          _loadPosts: [{ id: 1, item_ids: [] }],
        },
      });

      await vm.loadInitialPosts();
      expect(vm.markAsRead).toHaveBeenCalled();
    });
  });

  describe('loadPostUntilFirstUnread()', () => {
    function setupLoadPostUntilFirstUnread(obj: any) {
      const vm = setup({
        _newMessageSeparatorHandler: {
          enable: jest.fn(),
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

    it('should not load posts when distance to first unread is 0', async () => {
      const { vm, loadPosts } = setupLoadPostUntilFirstUnread({
        distanceToFirstUnread: -1,
      });

      await vm.loadPostUntilFirstUnread();

      expect(loadPosts).not.toHaveBeenCalled();
    });
  });

  describe('onReceiveProps()', () => {
    it('should dispose transformHandler when groupId change', () => {
      const vm = setup();
      jest.spyOn(vm, 'dispose');

      vm.onReceiveProps({ groupId: 1 });

      expect(vm.dispose).toHaveBeenCalledTimes(1);
    });

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
});
