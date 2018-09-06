/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-05 00:17:13
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import ConversationStreamViewModel from '../ConversationStreamViewModel';
const { PostService, StateService, notificationCenter, ENTITY } = service;
import { StateService as IStateService, PostService as IPostService } from 'sdk/service';
import OrderListStore from '../../../../../store/base/OrderListStore';

jest.mock('../../../../../store/base/OrderListStore', () => jest.fn());
const postService = {} as IPostService;
const stateService = {} as IStateService;
jest.spyOn(PostService, 'getInstance').mockReturnValue(postService);
jest.spyOn(StateService, 'getInstance').mockReturnValue(stateService);
jest.spyOn(notificationCenter, 'on');
describe('ConversationStreamViewModel', () => {
  describe('constructor', () => {
    it('should construct', () => {
      expect(notificationCenter.on).toHaveBeenCalledTimes(0);
      const presenter = new ConversationStreamViewModel(1);
      expect(presenter).toHaveProperty('postService', postService);
      expect(presenter).toHaveProperty('stateService', stateService);
      expect((notificationCenter.on as jest.Mock).mock.calls[(notificationCenter.on as jest.Mock).mock.calls.length - 1][0]).toBe(ENTITY.POST);
      expect(OrderListStore).toHaveBeenCalled();
      expect((presenter as any).getStore()).toBe((OrderListStore as any).mock.instances[0]);
    });
  });
});
