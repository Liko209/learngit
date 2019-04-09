/*
 * @Author: Paynter Chen
 * @Date: 2019-03-06 20:01:52
 * Copyright © RingCentral. All rights reserved.
 */

import { ViewerViewModel } from '../Viewer.ViewModel';
import { notificationCenter } from 'sdk/service';
import { ITEM_SORT_KEYS } from 'sdk/module/item';

import { VIEWER_ITEM_TYPE } from '../constants';
import { ViewerViewProps } from '../types';
import { ItemListDataSource } from '../Viewer.DataSource';
import { QUERY_DIRECTION } from 'sdk/dao';
import * as mobx from 'mobx';

import { getEntity } from '@/store/utils';
import FileItemModel from '@/store/models/FileItem';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
  };
});
const item = {
  versionUrl: '',
  origWidth: 1,
  origHeight: 2,
} as FileItemModel;
getEntity.mockReturnValue(item);

jest.mock('../Viewer.DataSource', () => {
  const dataSource: ItemListDataSource = {
    loadInitialData: jest.fn(),
    getIds: jest.fn().mockReturnValue([]),
    dispose: jest.fn(),
    fetchData: jest.fn(),
    getFilterFunc: jest.fn().mockReturnValue(true),
    isExpectedItemOfThisGroup: jest.fn().mockReturnValue(true),
    fetchIndexInfo: jest.fn().mockImplementation(() => {}),
  };
  return {
    ItemListDataSource: () => dataSource,
  };
});

function createDataSource() {
  return new ItemListDataSource();
}

describe('Viewer.ViewModel', () => {
  const props: ViewerViewProps = {
    groupId: 123,
    type: VIEWER_ITEM_TYPE.IMAGE_FILES,
    itemId: 111,
    contentLeftRender: () => (props: any) => null,
  };

  let itemService: any = {
    getItemIndexInfo: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    itemService = {
      getItemIndexInfo: jest.fn().mockResolvedValue({}),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
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
<<<<<<< Updated upstream
      itemService.getItemIndexInfo.mockResolvedValue({
=======
      dataSource.fetchIndexInfo.mockResolvedValue({
>>>>>>> Stashed changes
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
    beforeEach(() => {
      jest.resetAllMocks();
    });
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
    beforeEach(() => {
      jest.resetAllMocks();
    });
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
});

describe('dispose reactions', () => {
  it('should dispose all reactions when dispose vm', () => {
    const disposer1 = jest.fn();
    const disposer2 = jest.fn();
    const disposer3 = jest.fn();
    jest.spyOn(mobx, 'reaction').mockReturnValueOnce(disposer1);
    jest.spyOn(mobx, 'reaction').mockReturnValueOnce(disposer2);
    jest.spyOn(mobx, 'reaction').mockReturnValueOnce(disposer3);
    const vm = new ViewerViewModel({});
    vm.dispose();
    expect(disposer1).toHaveBeenCalled();
    expect(disposer2).toHaveBeenCalled();
    expect(disposer3).toHaveBeenCalled();
  });
});
