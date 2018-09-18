/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-05 00:17:13
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { ConversationStreamViewModel } from '../ConversationStreamViewModel';
const { PostService, StateService, notificationCenter, ENTITY } = service;

import OrderListStore from '../../../../../store/base/OrderListStore';
import { ListStore } from '../../../../../store/base/ListStore';
jest.mock('../../../../../store/base/OrderListStore', () => jest.fn());
jest.mock('../../../../../store/base/ListStore', () => jest.fn());
const postService = {};
const stateService = {};
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
      expect(OrderListStore).toHaveBeenCalled();
      expect((presenter as any).orderListStore).toBeInstanceOf(OrderListStore);
    });
  });
});
