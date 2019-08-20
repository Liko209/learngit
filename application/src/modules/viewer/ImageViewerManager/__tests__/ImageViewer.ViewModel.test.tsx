/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-07 10:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity, getSingleEntity } from '@/store/utils';
import { ImageViewerViewModel } from '../ImageViewer.ViewModel';
import { VIEWER_ITEM_TYPE } from '../constants';
import { Notification } from '@/containers/Notification';
import { ENTITY_NAME } from '@/store';
import * as mobx from 'mobx';
import { ItemListDataSource } from '../Viewer.DataSource';
import { QUERY_DIRECTION } from 'sdk/dao';
import { EVENT_TYPES, notificationCenter } from 'sdk/service';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import * as module from 'sdk/module/item';
import * as utils from '../utils';

jest.mock('@/store/utils');
// jest.mock('sdk/service');
jest.mock('@/containers/Notification');
jest.mock('@/utils/error');
const dismiss = jest.fn();
const props = {
  // groupId: 1,
  postId: 1,
  initialOptions: {},
  dismiss: () => dismiss(),
  // itemId: 2,
  groupId: 123,
  // type: VIEWER_ITEM_TYPE.IMAGE_FILES,
  itemId: 111,
  type: VIEWER_ITEM_TYPE.IMAGE_FILES,
  isNavigation: false,
}
function getVM() {
  const vm = new ImageViewerViewModel(props);
  return vm;
}

jest.mock('../Viewer.DataSource', () => {
  const dataSource: ItemListDataSource = {
    loadInitialData: jest.fn(),
    getIds: jest.fn().mockReturnValue([]),
    dispose: jest.fn(),
    fetchData: jest.fn(),
    getFilterFunc: jest.fn().mockReturnValue(true),
    isExpectedItemOfThisGroup: jest.fn().mockReturnValue(true),
    fetchIndexInfo: jest.fn(),
  };
  return {
    ItemListDataSource: () => dataSource,
  };
});

function createDataSource() {
  return new ItemListDataSource();
}

describe('Viewer.ViewModel', () => {

  let itemService: any = {
    getItemIndexInfo: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    itemService = {
      getItemIndexInfo: jest.fn().mockResolvedValue({}),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
    const item = {
      versionUrl: '',
      origWidth: 1,
      origHeight: 2,
      deactivated: false,
      isArchived: false,
      getDirectRelatedPostInGroup: jest.fn(() => ({})),
    };
    (getEntity as jest.Mock).mockReturnValue(item);
    (getSingleEntity as jest.Mock).mockReturnValue(item);
  });
  describe('constructor()', () => {
    it('should successfully construct', () => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([1, 2]);
      const vm = getVM();
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
      const vm = getVM();
      expect(notificationOn).toBeCalled();
      notificationOn.mockRestore();
      vm.dispose();
    });
  });
  describe('hasPrevious', () => {
    it('should hasPrevious', () => {
      const vm = getVM();
      vm.total = 2;
      vm.updateCurrentItemIndex(1, 1);
      expect(vm.hasPrevious).toBeTruthy();
    });
    it('should not hasPrevious', () => {
      const vm = getVM();
      vm.total = 2;
      vm.updateCurrentItemIndex(1, 1);
      expect(vm.hasPrevious).toBeTruthy();
    });
  });
  describe('hasNext', () => {
    it('should hasNext', () => {
      const vm = getVM();
      vm.total = 2;
      vm.updateCurrentItemIndex(0, 1);
      expect(vm.hasNext).toBeTruthy();
    });
    it('should not hasNext', () => {
      const vm = getVM();
      vm.total = 2;
      vm.updateCurrentItemIndex(1, 1);
      expect(vm.hasNext).toBeFalsy();
    });
  });
  describe('updateCurrentItemIndex()', () => {
    it('should currentIndex, currentItemId has default value when not set', () => {
      const vm = getVM();
      expect(vm.currentIndex).toEqual(-1);
      expect(vm.currentItemId).toEqual(props.itemId);
      vm.dispose();
    });
    it('should updateCurrentItemIndex correctly', () => {
      const vm = getVM();
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
      const vm = getVM();
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
      const vm = getVM();
      vm.dispose();
      expect(notificationOff).toBeCalled();
      expect(dataSource.dispose).toBeCalled();
    });
  });
  describe('fetchData()', () => {
    it('should dispose dataSource & notification', () => {
      const dataSource = createDataSource();
      const vm = getVM();
      vm.loadMore(QUERY_DIRECTION.NEWER);
      expect(dataSource.fetchData).lastCalledWith(QUERY_DIRECTION.NEWER, 20);
      vm.dispose();
    });
  });
  describe('switchToPrevious()', () => {
    it('should load data then switch to previous', (done: jest.DoneCallback) => {
      const dataSource = createDataSource();
      dataSource.getIds.mockReturnValue([2]);
      const vm = new ImageViewerViewModel({ ...props, itemId: 2 });
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
      const vm = new ImageViewerViewModel({ ...props, itemId: 2 });
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
      const vm = new ImageViewerViewModel({ ...props, itemId: 2 });
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
      const vm = new ImageViewerViewModel({ ...props, itemId: 2 });
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
      const vm = new ImageViewerViewModel({ ...props, itemId: 2 });
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
      const vm = new ImageViewerViewModel({ ...props, itemId: 2 });
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

      const vm = new ImageViewerViewModel({ ...props, itemId: 1 });
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

describe('dispose reactions', () => {
  it('should dispose all reactions when dispose vm', () => {
    const disposer1 = jest.fn();
    const disposer2 = jest.fn();
    const disposer3 = jest.fn();
    jest.spyOn(mobx, 'reaction').mockReturnValueOnce(disposer1);
    jest.spyOn(mobx, 'reaction').mockReturnValueOnce(disposer2);
    jest.spyOn(mobx, 'reaction').mockReturnValueOnce(disposer3);
    const vm = getVM();
    vm.dispose();
    expect(disposer1).toHaveBeenCalled();
    expect(disposer2).toHaveBeenCalled();
    expect(disposer3).toHaveBeenCalled();
  });
});



describe('ImageViewerViewModel', () => {
  beforeEach(() => {
    // jest.resetAllMocks();
    const itemFun = {
      getDirectRelatedPostInGroup: jest.fn(() => ({})),
    };
    Notification.flashToast = jest.fn();
    (getEntity as jest.Mock).mockReturnValue(itemFun);
  });
  describe('viewerDestroyer()', () => {
    it('should dismiss be call when call viewerDestroyer function', () => {
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: [] },
        getDirectRelatedPostInGroup: jest.fn(() => ({})),
      });
      const vm = getVM();
      vm.viewerDestroyer();
      expect(dismiss).toHaveBeenCalled();
    });
  });

  describe('constructor()', () => {
    it('should init correctly', () => {
      const autoRunSpy = jest.spyOn(mobx, 'autorun').mockImplementation(e => e);

      const vm = getVM();
      expect(vm._sender).toBe(null);
      expect(vm._createdAt).toBe(null);
      expect(autoRunSpy).toHaveBeenCalledWith(vm.updateSenderInfo, undefined);
      autoRunSpy.mockRestore();
    });
  });

  describe('pages()', () => {
    it('should be return undefined when type not image ', () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'file',
      });
      const vm = getVM();
      expect(vm.pages).toEqual([
        {
          url: undefined,
          viewport: {
            origHeight: 0,
            origWidth: 0,
          },
        },
      ]);
    });
    it('should be return not undefined when pages not undefined', () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'jpg',
      });
      const vm = getVM();
      vm['_largeRawImageURL'] = 'url';
      expect(vm.pages && vm.pages[0].url).toEqual('url');
    });
  });

  describe('title()', () => {
    it('should be return not undefined when call title()', () => {
      (getEntity as jest.Mock).mockReturnValue({
        latestVersion: { pages: undefined },
        getDirectRelatedPostInGroup: () => 123,
      });
      const vm = getVM();
      expect(vm.title).toBeTruthy();
    });
  });

  describe('updateSenderInfo()', () => {
    it('should get post from item.getDirectRelatedPostInGroup', async (done: any) => {
      const fileItem = {
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(),
      };
      (getEntity as jest.Mock).mockReturnValue(fileItem);
      const vm = getVM();

      await vm.updateSenderInfo();

      expect(fileItem.getDirectRelatedPostInGroup).toHaveBeenCalled();

      done();
    });

    it('should get sender when item.getDirectRelatedPostInGroup return post', async (done: any) => {
      const fileItem = {
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(() => ({ creator_id: 123 })),
      };
      (getEntity as jest.Mock).mockReturnValue(fileItem);
      const vm = getVM();

      await vm.updateSenderInfo();

      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.PERSON, 123);

      done();
    });

    it('should set sender and createdAt to null when cannot get post [JPT-2399]', async (done: any) => {
      const fileItem = {
        latestVersion: { pages: [1, 2] },
        getDirectRelatedPostInGroup: jest.fn(() => null),
      };
      (getEntity as jest.Mock).mockReturnValue(fileItem);
      const vm = getVM();
      vm._sender = {};
      vm._createdAt = {};
      expect(vm._sender).toBeTruthy();

      await vm.updateSenderInfo();

      expect(vm._sender).toBe(null);
      expect(vm._createdAt).toBe(null);

      done();
    });
  });
});