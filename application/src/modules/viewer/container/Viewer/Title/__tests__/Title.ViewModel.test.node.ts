/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { ViewerTitleViewModel } from '../Title.ViewModel';
import { ViewerTitleProps } from '../types';
import * as mobx from 'mobx';
import * as storeUtils from '@/store/utils';
import { ENTITY_NAME } from '@/store';

jest.mock('@/store/utils');
const props: ViewerTitleProps = {
  groupId: 1,
  itemId: 1,
  currentItemId: 1,
  currentIndex: 1,
  total: 1,
};

describe('TitleViewModel', () => {
  const autoRunSpy = jest.spyOn(mobx, 'autorun').mockImplementation(e => e);
  function getVM() {
    const vm = new ViewerTitleViewModel(props);
    return vm;
  }
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor()', () => {
    it('should init correctly', () => {
      const vm = getVM();
      expect(vm.sender).toBe(null);
      expect(vm.createdAt).toBe(null);
      expect(autoRunSpy).toBeCalledWith(vm.updateSenderInfo, undefined);
    });
  });

  describe('item()', () => {
    it('should be return Item info when call item()', () => {
      const vm = getVM();
      (getEntity as jest.Mock).mockReturnValue({ itemId: 1 });
      expect(vm.item).toEqual({ itemId: 1 });
    });
  });

  describe('updateSenderInfo()', () => {
    it('should get post from item.getDirectRelatedPostInGroup', async (done: any) => {
      const fileItem = {
        getDirectRelatedPostInGroup: jest.fn(),
      };
      const spy = jest.spyOn(storeUtils, 'getEntity').mockReturnValue(fileItem);
      const vm = getVM();

      await vm.updateSenderInfo();

      expect(fileItem.getDirectRelatedPostInGroup).toBeCalled();

      spy.mockRestore();
      done();
    });

    it('should get sender when item.getDirectRelatedPostInGroup return post', async (done: any) => {
      const createdAt = 123123;
      const fileItem = {
        getDirectRelatedPostInGroup: jest.fn(() => ({
          creator_id: 123,
          created_at: createdAt,
        })),
      };
      const spy = jest.spyOn(storeUtils, 'getEntity').mockReturnValue(fileItem);
      const vm = getVM();

      await vm.updateSenderInfo();

      expect(spy).toBeCalledWith(ENTITY_NAME.PERSON, 123);
      expect(vm.createdAt).toBe(createdAt);

      spy.mockRestore();
      done();
    });

    it('should set sender and createdAt to null when cannot get post [JPT-2399]', async (done: any) => {
      const fileItem = {
        getDirectRelatedPostInGroup: jest.fn(() => null),
      };
      const spy = jest.spyOn(storeUtils, 'getEntity').mockReturnValue(fileItem);
      const vm = getVM();
      vm.sender = {};
      vm.createdAt = {};

      await vm.updateSenderInfo();

      expect(vm.sender).toBe(null);
      expect(vm.createdAt).toBe(null);

      spy.mockRestore();
      done();
    });
  });
});
