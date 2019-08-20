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
import { FileItemUtils } from 'sdk/module/item/module/file/utils';

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
  describe('_transformFunc()', () => {
    it('should get version date as SortableModel data property', () => {
      const dataSource = new ItemListDataSource(props);
      const item: Item = {
        id: 1,
        post_ids: [111, 222],
      } as Item;
      const result = dataSource['_transformFunc'](item);
      expect(result.sortValue).toEqual(222);
    });
  });
  describe('constructor()', () => {
    it('should successfully construct', () => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([1, 2]);
      const vm = new ViewerViewModel(props);
      vm.setOnCurrentItemDeletedCb(() => {});
      vm.setOnItemSwitchCb(() => {});
      vm.isLoadingMore;
      vm.switchToNext;
      vm.switchToPrevious;
      expect(vm.currentItemId).toEqual(props.itemId);
      vm.updateCurrentItemIndex(0, 1);
      expect(vm.isLoadingMore).toEqual(false);
      expect(vm).toHaveProperty('props');
      expect(vm.currentIndex).toEqual(0);
      expect(vm.currentItemId).toEqual(1);
      expect(vm.getCurrentIndex()).toEqual(0);
      expect(vm.getCurrentItemId()).toEqual(1);
      expect(vm.total).toEqual(-1);
      expect(vm.ids).toEqual([1, 2]);
      vm.dispose();
    });
    it('should listen item change', () => {
      const notificationOn = jest.spyOn(notificationCenter, 'on');
      const vm = new ViewerViewModel(props);
      expect(notificationOn).toBeCalled();
      notificationOn.mockRestore();
      vm.dispose();
    });
  });
  describe('hasPrevious', () => {
    it('should hasPrevious', () => {
      const vm = new ViewerViewModel(props);
      vm.total = 2;
      vm.updateCurrentItemIndex(1, 1);
      expect(vm.hasPrevious).toBeTruthy();
    });
    it('should not hasPrevious', () => {
      const vm = new ViewerViewModel(props);
      vm.total = 2;
      vm.updateCurrentItemIndex(1, 1);
      expect(vm.hasPrevious).toBeTruthy();
    });
  });
  describe('hasNext', () => {
    it('should hasNext', () => {
      const vm = new ViewerViewModel(props);
      vm.total = 2;
      vm.updateCurrentItemIndex(0, 1);
      expect(vm.hasNext).toBeTruthy();
    });
    it('should not hasNext', () => {
      const vm = new ViewerViewModel(props);
      vm.total = 2;
      vm.updateCurrentItemIndex(1, 1);
      expect(vm.hasNext).toBeFalsy();
    });
  });
  describe('updateCurrentItemIndex()', () => {
    it('should currentIndex, currentItemId has default value when not set', () => {
      const vm = new ViewerViewModel(props);
      expect(vm.currentIndex).toEqual(-1);
      expect(vm.currentItemId).toEqual(props.itemId);
      vm.dispose();
    });
    it('should updateCurrentItemIndex correctly', () => {
      const vm = new ViewerViewModel(props);
      vm.updateCurrentItemIndex(1, 2);
      expect(vm.currentIndex).toEqual(1);
      expect(vm.currentItemId).toEqual(2);
      vm.dispose();
    });
  });
  describe('init()', () => {
    it('should loadInitialData and refresh itemIndexInfo', async (done: jest.DoneCallback) => {
      const dataSource = createDataSource();
      dataSource.fetchIndexInfo.mockResolvedValue({
        index: 11,
        totalCount: 22,
      });
      const vm = new ViewerViewModel(props);
      await vm.init();
      setTimeout(() => {
        expect(dataSource.loadInitialData).toBeCalled();
        expect(dataSource.fetchIndexInfo).toBeCalledWith(props.itemId);

        expect(vm.total).toEqual(22);
        expect(vm.currentIndex).toEqual(11);
        vm.dispose();
        done();
      });
    });
  });
  describe('dispose()', () => {
    it('should dispose dataSource & notification', () => {
      const dataSource = createDataSource();
      const notificationOff = jest.spyOn(notificationCenter, 'off');
      const vm = new ViewerViewModel(props);
      vm.dispose();
      expect(notificationOff).toBeCalled();
      expect(dataSource.dispose).toBeCalled();
    });
  });
  describe('fetchData()', () => {
    it('should dispose dataSource & notification', () => {
      const dataSource = createDataSource();
      const vm = new ViewerViewModel(props);
      vm.loadMore(QUERY_DIRECTION.NEWER);
      expect(dataSource.fetchData).lastCalledWith(QUERY_DIRECTION.NEWER, 20);
      vm.dispose();
    });
  });
  describe('switchToPrevious()', () => {
    it('should load data then switch to previous', (done: jest.DoneCallback) => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([2]);
      const vm = new ViewerViewModel({ ...props, itemId: 2 });
      // vm.updateCurrentItemIndex(1, props.itemId);
      vm.currentIndex = 1;
      vm.total = 3;
      const loadMore = jest.spyOn(vm, 'loadMore').mockResolvedValueOnce([1]);
      const fn2 = jest.spyOn(vm, 'switchToPrevious');
      expect(vm.hasPrevious).toBeTruthy();
      vm.switchToPrevious();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.OLDER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(2);
        done();
      });
    });
    it('should not switch if load not more data', (done: jest.DoneCallback) => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([2]);
      const vm = new ViewerViewModel({ ...props, itemId: 2 });
      vm.currentIndex = 1;
      vm.total = 3;
      const loadMore = jest.spyOn(vm, 'loadMore').mockResolvedValueOnce(null);
      const fn2 = jest.spyOn(vm, 'switchToPrevious');
      expect(vm.hasPrevious).toBeTruthy();
      vm.switchToPrevious();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.OLDER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(1);
        done();
      });
    });
    it('should update index directly when ids has pre image', () => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([1, 2]);
      const vm = new ViewerViewModel({ ...props, itemId: 2 });
      vm.currentIndex = 1;
      vm.total = 2;
      const updateCurrentItemIndex = jest.spyOn(vm, 'updateCurrentItemIndex');
      expect(vm.hasPrevious).toBeTruthy();
      vm.switchToPrevious();
      expect(updateCurrentItemIndex).toBeCalled();
    });
  });
  describe('switchToNext()', () => {
    it('should load data then switch to NextImage', (done: jest.DoneCallback) => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([2]);
      const vm = new ViewerViewModel({ ...props, itemId: 2 });
      vm.currentIndex = 1;
      vm.total = 3;
      const loadMore = jest.spyOn(vm, 'loadMore').mockResolvedValueOnce([3]);
      const fn2 = jest.spyOn(vm, 'switchToNext');
      expect(vm.hasNext).toBeTruthy();
      vm.switchToNext();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.NEWER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(2);
        done();
      });
    });
    it('should not switch image if load not more data', (done: jest.DoneCallback) => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([2]);
      const vm = new ViewerViewModel({ ...props, itemId: 2 });
      vm.currentIndex = 1;
      vm.total = 3;
      vm.updateCurrentItemIndex(1, props.itemId);
      const loadMore = jest.spyOn(vm, 'loadMore').mockResolvedValueOnce(null);
      const fn2 = jest.spyOn(vm, 'switchToNext');
      expect(vm.hasNext).toBeTruthy();
      vm.switchToNext();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.NEWER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(1);
        done();
      });
    });

    it('should update index directly when ids has next image', () => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([2, 3]);
      const vm = new ViewerViewModel({ ...props, itemId: 2 });
      vm.currentIndex = 1;
      vm.total = 3;
      const updateCurrentItemIndex = jest.spyOn(vm, 'updateCurrentItemIndex');
      expect(vm.hasNext).toBeTruthy();
      vm.switchToNext();
      expect(updateCurrentItemIndex).toBeCalled();
    });
  });
  describe('user delete item', () => {
    it('should call getNextItemToDisplay [JPT-2033]', async done => {
      const itemNotificationKey = 'key';
      jest
        .spyOn(module.ItemNotification, 'getItemNotificationKey')
        .mockReturnValue(itemNotificationKey);

      const getNextItemToDisplaySpy = jest
        .spyOn(utils, 'getNextItemToDisplay')
        .mockReturnValue({ index: 2, itemId: 123 });
      jest.spyOn(utils, 'isExpectedItemOfThisGroup').mockReturnValue(true);
      const dataSource = createDataSource();
      dataSource.fetchIndexInfo.mockReturnValue({ totalCount: 1, index: -1 });

      const vm = new ViewerViewModel({ ...props, itemId: 1 });
      vm.currentIndex = 1;
      vm.total = 3;
      notificationCenter.emit(itemNotificationKey, {
        type: EVENT_TYPES.UPDATE,
        body: { entities: [{}] },
      });
      setImmediate(() => {
        expect(getNextItemToDisplaySpy).toHaveBeenCalled();
        done();
      });
    });
  });
});
