/*
 * @Author: Paynter Chen
 * @Date: 2019-03-07 09:49:43
 * Copyright © RingCentral. All rights reserved.
 */

// import { observable, action } from 'mobx';
import { FetchSortableDataListHandler } from '@/store/base/fetch';

import { VIEWER_ITEM_TYPE } from '../constants';
import {
  ItemListDataSourceProps,
  ItemListDataSource,
} from '../Viewer.DataSource';
import { QUERY_DIRECTION } from 'sdk/dao';
import { Item } from 'sdk/module/item/entity';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { ITEM_SORT_KEYS } from 'sdk/module/item';

jest.mock('sdk/module/item/module/file/utils');

jest.mock('@/store/base/fetch/FetchSortableDataListHandler', () => {
  const handler: FetchSortableDataListHandler<Item> = {
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

describe('Viewer.DataSource', () => {
  const props: ItemListDataSourceProps = {
    groupId: 123,
    type: VIEWER_ITEM_TYPE.IMAGE_FILES,
  };
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('fetchData()', () => {
    it('should call listHandler.fetchData with correct params', async () => {
      const dataSource = new ItemListDataSource(props);
      const listHandler = new FetchSortableDataListHandler();
      const mockResult = {};
      listHandler.fetchData.mockResolvedValue(mockResult);
      const result = await dataSource.fetchData(QUERY_DIRECTION.NEWER, 20);
      dataSource.dispose();
      expect(listHandler.fetchData).toBeCalledWith(QUERY_DIRECTION.NEWER, 20);
      expect(result).toEqual(mockResult);
    });
  });
  describe('loadInitialData()', () => {
    it('should call listHandler.fetchDataByAnchor with correct params', async () => {
      const dataSource = new ItemListDataSource(props);
      const listHandler = new FetchSortableDataListHandler();
      const mockResult = {};
      listHandler.fetchDataByAnchor.mockResolvedValue(mockResult);
      const itemId = 22;
      const result = await dataSource.loadInitialData(itemId, 20);
      expect(listHandler.fetchDataByAnchor).toBeCalledWith(
        QUERY_DIRECTION.BOTH,
        20,
        {
          id: itemId,
          sortValue: undefined,
        },
      );
      expect(result).toEqual(mockResult);
    });
  });
  describe('hasMore()', () => {
    it('should return listHandler.hasMore()', () => {
      const dataSource = new ItemListDataSource(props);
      const listHandler = new FetchSortableDataListHandler();
      listHandler.hasMore.mockReturnValue(true);
      const hasMore = dataSource.hasMore(QUERY_DIRECTION.NEWER);
      expect(hasMore).toBeTruthy();
    });
  });
  describe('getIds()', () => {
    it('should return listHandler.sortableListStore.getIds', () => {
      const dataSource = new ItemListDataSource(props);
      const listHandler = new FetchSortableDataListHandler();
      const ids = dataSource.getIds();
      expect(ids).toEqual(listHandler.sortableListStore.getIds);
    });
  });
  describe('size()', () => {
    it('should return listHandler.sortableListStore.size', () => {
      const dataSource = new ItemListDataSource(props);
      const listHandler = new FetchSortableDataListHandler();
      const result = dataSource.size();
      expect(result).toEqual(listHandler.sortableListStore.size);
    });
  });
  describe('get()', () => {
    it('should return listHandler.sortableListStore.ids(index)', () => {
      const dataSource = new ItemListDataSource(props);
      const listHandler = new FetchSortableDataListHandler();
      const result = dataSource.get(1);
      expect(result).toEqual(listHandler.sortableListStore.getIds[1]);
    });
  });
  describe('isExpectedItemOfThisGroup()', () => {
    const fileId = TypeDictionary.TYPE_ID_FILE;
    const notFileId = TypeDictionary.TYPE_ID_TASK;
    it.each`
      expected | groupId | groupIds | postIds | itemId    | deactivated | includeDeactivated
      ${true}  | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${0}    | ${[1]}   | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[2]}   | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[]}    | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${true}     | ${false}
      ${true}  | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${false}    | ${true}
      ${true}  | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${true}     | ${true}
    `(
      'should work correctly with Image type',
      ({
        groupId,
        groupIds,
        postIds,
        itemId,
        deactivated,
        includeDeactivated,
        expected,
      }) => {
        const dataSource = new ItemListDataSource(props);
        const item: Item = {
          deactivated,
          id: itemId,
          group_ids: groupIds,
          post_ids: postIds,
        } as Item;
        jest
          .spyOn(dataSource, 'getFilterFunc')
          .mockImplementation(() => (item: Item) => {
            return true;
          });
        const result = dataSource.isExpectedItemOfThisGroup(
          groupId,
          VIEWER_ITEM_TYPE.IMAGE_FILES,
          item,
          includeDeactivated,
        );
        expect(result).toEqual(expected);
      },
    );
    it.each`
      expected | groupId | groupIds | postIds | itemId       | deactivated | includeDeactivated
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${0}    | ${[1]}   | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[2]}   | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[]}    | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${true}     | ${false}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${false}    | ${true}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${true}     | ${true}
    `(
      'should work correctly with Image type when item not a image',
      ({
        groupId,
        groupIds,
        postIds,
        itemId,
        deactivated,
        includeDeactivated,
        expected,
      }) => {
        const dataSource = new ItemListDataSource(props);
        const item: Item = {
          deactivated,
          id: itemId,
          group_ids: groupIds,
          post_ids: postIds,
        } as Item;
        jest
          .spyOn(dataSource, 'getFilterFunc')
          .mockImplementation(() => (item: Item) => {
            return true;
          });
        const result = dataSource.isExpectedItemOfThisGroup(
          groupId,
          VIEWER_ITEM_TYPE.IMAGE_FILES,
          item,
          includeDeactivated,
        );
        expect(result).toEqual(expected);
      },
    );
  });
  describe('_transformFunc()', () => {
    it('should get version date as SortableModel data property', () => {
      const dataSource = new ItemListDataSource(props);
      const item: Item = {
        id: 1,
      } as Item;
      const mockVersionDate = 222;
      FileItemUtils.getVersionDate.mockReturnValue(mockVersionDate);
      const result = dataSource['_transformFunc'](item);
      expect(FileItemUtils.getVersionDate).toBeCalledWith({ id: 1 });
      expect(result.sortValue).toEqual(mockVersionDate);
    });
  });
});
