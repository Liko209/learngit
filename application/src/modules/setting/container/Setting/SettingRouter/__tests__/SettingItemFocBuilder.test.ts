/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchSortableDataListHandler } from '@/store/base/fetch';

import {
  SettingItemDataProvider,
  SettingLeftRailDataProvider,
  SettingItemFocBuilder,
} from '../../SettingItemFocBuilder';
import { UserSettingEntity } from 'sdk/module/setting/entity';

jest.mock('@/store/base/fetch/FetchSortableDataListHandler', () => {
  const handler: FetchSortableDataListHandler<UserSettingEntity<any>> = {
    fetchData: jest.fn(),
    getIds: jest.fn(),
    hasMore: jest.fn(),
    dispose: jest.fn(),
    fetchDataByAnchor: jest.fn(),
    sortableListStore: { getIds: [1, 2], size: 0 },
  };
  return {
    FetchSortableDataListHandler: () => {
      return handler;
    },
  };
});

describe('SettingItemListHandle', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('dataProvide()', () => {
    it('should call SettingItemDataProvider when new SettingItemListHandle has props ', () => {
      new SettingItemFocBuilder().buildLeftRailFoc();
      expect(SettingLeftRailDataProvider).toBeCalled;
    });
    it('should call SettingItemDataProvider  when new SettingItemListHandle has not props ', () => {
      new SettingItemFocBuilder().buildSettingItemFoc(21);
      expect(SettingItemDataProvider).toBeCalled;
    });
  });

  describe('_transformFunc()', () => {
    it('should get version date as SortableModel data property', () => {
      const dataSource = new SettingItemFocBuilder();
      const item: UserSettingEntity<any> = {
        id: 1,
        weight: 100,
      } as UserSettingEntity<any>;
      const result = dataSource['_transformFunc'](item);
      expect(result.sortValue).toEqual(100);
    });
  });
});
