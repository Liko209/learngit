/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingRouterViewModel } from '../SettingRouter.ViewModel';
import { getEntity } from '@/store/utils';
// import { SettingItemFocBuilder } from '../../SettingItemFocBuilder';

jest.mock('../../SettingItemFocBuilder', () => {
  const listHandle: any = {
    sortableListStore: {
      getIds: [101],
    },
    fetchData: jest.fn(),
  };
  return {
    SettingItemFocBuilder: () => ({
      buildLeftRailFoc: () => listHandle,
    }),
  };
});

jest.mock('@/store/utils');

describe('SettingRouterViewModel', () => {
  beforeEach(() => {});
  describe('leftRailItemIds()', () => {
    it('should get [101] when leftRailItemIds', () => {
      const VM = new SettingRouterViewModel();
      const mockData = { id: 10, weight: 10, value: 10 };
      (getEntity as jest.Mock).mockReturnValue(mockData);
      const result = VM.leftRailItemIds;
      expect(result).toEqual([101]);
    });
  });

  describe('getItem()', () => {
    it('should equal data when getItem by id', () => {
      const VM = new SettingRouterViewModel();
      const mockData = { id: 10, weight: 10, value: 10 };
      (getEntity as jest.Mock).mockReturnValue(mockData);
      const result = VM.getItem(10);
      expect(result).toEqual(mockData);
    });
  });

  describe('updateCurrentLeftRailId()', () => {
    it('should update currentLeftRailId when call updateCurrentLeftRailId', () => {
      const VM = new SettingRouterViewModel();
      VM.updateCurrentLeftRailId(10);
      expect(VM.currentLeftRailId).toEqual(10);
    });
  });
});
