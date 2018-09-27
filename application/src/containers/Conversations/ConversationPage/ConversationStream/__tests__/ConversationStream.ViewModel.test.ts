/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-05 00:17:13
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import OrderListStore from '../../../../../store/base/OrderListStore';
import { ConversationStreamViewModel } from '../ConversationStream.ViewModel';

const { PostService, StateService } = service;

jest.mock('sdk/service');
jest.mock('../../../../../store/base/OrderListStore');
jest.mock('../../../../../store/base/ListStore');

const postService = new PostService();
const stateService = new StateService();
PostService.getInstance = jest
  .fn()
  .mockName('PostService')
  .mockReturnValue(postService);
StateService.getInstance = jest
  .fn()
  .mockName('StateService')
  .mockReturnValue(stateService);

describe('ConversationStreamViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should work', () => {
      const vm = new ConversationStreamViewModel({ groupId: 1 });
      expect(vm).toHaveProperty('postService', postService);
      expect(vm).toHaveProperty('stateService', stateService);
      expect(OrderListStore).toHaveBeenCalled();
      expect((vm as any).orderListStore).toBeInstanceOf(OrderListStore);
    });
  });

  describe('componentDidMount()', () => {
    it('should mark as read & update last group', () => {
      const vm = new ConversationStreamViewModel({ groupId: 1 });
      vm.componentDidMount();
      expect(stateService.markAsRead).toHaveBeenCalled();
      expect(stateService.updateLastGroup).toHaveBeenCalled();
    });
  });

  describe('componentDidUpdate()', () => {
    it('should mark as read & update last group', () => {
      const vm = new ConversationStreamViewModel({ groupId: 1 });

      vm.componentDidUpdate();

      expect(stateService.markAsRead).toHaveBeenCalled();
      expect(stateService.updateLastGroup).toHaveBeenCalled();
    });
  });

  describe('loadInitialPosts()', () => {
    it('should have loading before finished', async () => {
      const vm = new ConversationStreamViewModel({ groupId: 1 });

      const promise = vm.loadInitialPosts();

      expect(vm).toHaveProperty('loading', true);
      await promise;
      expect(vm).toHaveProperty('loading', false);
    });
  });
});
