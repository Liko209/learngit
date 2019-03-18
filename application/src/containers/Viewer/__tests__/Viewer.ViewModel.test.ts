/*
 * @Author: Paynter Chen
 * @Date: 2019-03-06 20:01:52
 * Copyright © RingCentral. All rights reserved.
 */

import { ViewerViewModel } from '../Viewer.ViewModel';
import { notificationCenter } from 'sdk/service';
import { ItemService } from 'sdk/module/item';

import { VIEWER_ITEM_TYPE } from '../constants';
import { ViewerViewProps } from '../types';
import { ItemListDataSource } from '../Viewer.DataSource';
import { QUERY_DIRECTION } from 'sdk/dao';

// jest.mock('sdk/service/notificationCenter');
jest.mock('sdk/module/item/service', () => {
  const service: ItemService = {
    getItemIndexInfo: jest.fn().mockResolvedValue({}),
  };
  return {
    ItemService: {
      getInstance: () => service,
    },
  };
});
jest.mock('../Viewer.DataSource', () => {
  const dataSource: ItemListDataSource = {
    loadInitialData: jest.fn(),
    getIds: jest.fn(),
    dispose: jest.fn(),
    fetchData: jest.fn(),
    getFilterFunc: jest.fn().mockReturnValue(true),
    isExpectedItemOfThisGroup: jest.fn().mockReturnValue(true),
  };
  return {
    ItemListDataSource: () => dataSource,
  };
});

describe('Viewer.ViewModel', () => {
  const props: ViewerViewProps = {
    groupId: 123,
    type: VIEWER_ITEM_TYPE.IMAGE_FILES,
    itemId: 111,
    contentLeftRender: () => (props: any) => null,
  };
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('constructor()', () => {
    it('should successfully construct', () => {
      const vm = new ViewerViewModel(props);
      const dataSource = new ItemListDataSource();
      dataSource.getIds.mockReturnValue([1, 2]);
      vm.currentItemId;
      vm.total;
      vm.ids;
      vm.setOnCurrentItemDeletedCb(() => {});
      expect(vm).toHaveProperty('props');
      expect(vm.currentIndex).toEqual(-1);
      expect(vm.currentItemId).toEqual(props.itemId);
      expect(vm.getCurrentIndex()).toEqual(-1);
      expect(vm.getCurrentItemId()).toEqual(props.itemId);
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
      const vm = new ViewerViewModel(props);
      const dataSource = new ItemListDataSource();
      const itemService: ItemService = ItemService.getInstance();
      itemService.getItemIndexInfo.mockResolvedValue({
        index: 11,
        totalCount: 22,
      });
      await vm.init();
      setTimeout(() => {
        expect(dataSource.loadInitialData).toBeCalled();
        expect(itemService.getItemIndexInfo).toBeCalled();

        expect(vm.total).toEqual(22);
        expect(vm.currentIndex).toEqual(11);
        vm.dispose();
        done();
      });
    });
  });
  describe('dispose()', () => {
    it('should dispose dataSource & notification', () => {
      const vm = new ViewerViewModel(props);
      const dataSource = new ItemListDataSource();
      const notificationOff = jest.spyOn(notificationCenter, 'off');
      vm.dispose();
      expect(notificationOff).toBeCalled();
      expect(dataSource.dispose).toBeCalled();
    });
  });
  describe('fetchData()', () => {
    it('should dispose dataSource & notification', () => {
      const vm = new ViewerViewModel(props);
      const dataSource = new ItemListDataSource();
      vm.fetchData(QUERY_DIRECTION.NEWER, 10);
      expect(dataSource.fetchData).lastCalledWith(QUERY_DIRECTION.NEWER, 10);
      vm.dispose();
    });
  });
});
