/*
 * @Author: Paynter Chen
 * @Date: 2019-03-06 20:01:52
 * Copyright © RingCentral. All rights reserved.
 */

import { ImageViewerViewModel } from '../ImageViewer.ViewModel';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { getEntity } from '@/store/utils';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import { ImageViewerProps } from '../types';
import { VIEWER_ITEM_TYPE } from '../../../constants';
import { QUERY_DIRECTION } from 'sdk/dao';
import FileItemModel from '@/store/models/FileItem';

jest.mock('@/common/getThumbnailURL');
jest.mock('sdk/module/item/module/file/utils');
jest.mock('sdk/api');
jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
  };
});
jest.mock('@/common/getThumbnailURL', () => {
  return {
    getMaxThumbnailURLInfo: jest.fn(),
  };
});

describe('ImageViewer.ViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const props: ImageViewerProps = {
    groupId: 123,
    type: VIEWER_ITEM_TYPE.IMAGE_FILES,
    itemId: 111,
    getCurrentIndex: jest.fn().mockReturnValue(22),
    getCurrentItemId: jest.fn().mockReturnValue(11),

    init: jest.fn(),
    currentItemId: 11,
    currentIndex: 22,
    total: 33,
    ids: [1, 2],
    updateCurrentItemIndex: jest.fn(),
    fetchData: jest.fn(),
    setOnCurrentItemDeletedCb: jest.fn(),
    initialOptions: {
      thumbnailSrc: 'xxx',
      initialWidth: 11,
      initialHeight: 22,
    },
  };
  describe('constructor', () => {
    it('should successfully construct', () => {
      const vm = new ImageViewerViewModel(props);
      vm.imageHeight;
      vm.imageWidth;
      vm.imageUrl;
      vm.isLoadingMore;
      vm.item;
      vm.switchNextImage;
      vm.switchPreImage;
      vm.props.getCurrentIndex.mockReturnValue(22);
      expect(vm.hasPrevious).toEqual(true);
      expect(vm.hasNext).toEqual(true);
      expect(vm.thumbnailSrc).toEqual('xxx');
      expect(vm).toHaveProperty('props');
    });
  });
  describe('imageInfo', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call isSupportShow', () => {
      const vm = new ImageViewerViewModel(props);
      const imageInfo = vm.imageInfo;
      FileItemUtils.isSupportShowRawImage.mockReturnValue(false);
      FileItemUtils.isSupportPreview.mockReturnValue(false);
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).toBeCalled();
      expect(imageInfo).toEqual({
        url: undefined,
        width: 0,
        height: 0,
      });
    });
    it('should return raw image info when support', () => {
      const vm = new ImageViewerViewModel(props);
      const item = {
        versionUrl: '',
        origWidth: 1,
        origHeight: 2,
      } as FileItemModel;
      getEntity.mockReturnValue(item);
      FileItemUtils.isSupportShowRawImage.mockReturnValue(true);
      const imageInfo = vm.imageInfo;
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).not.toBeCalled();
      expect(imageInfo).toEqual({
        url: item.versionUrl,
        width: item.origWidth,
        height: item.origHeight,
      });
    });
    it('should return thumbnail image when support', () => {
      const vm = new ImageViewerViewModel(props);
      const item = {
        downloadUrl: '',
        origWidth: 1,
        origHeight: 2,
      };
      getEntity.mockReturnValue(item);
      FileItemUtils.isSupportShowRawImage.mockReturnValue(false);
      FileItemUtils.isSupportPreview.mockReturnValue(true);
      getMaxThumbnailURLInfo.mockReturnValue({});
      const imageInfo = vm.imageInfo;
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).toBeCalled();
      expect(getMaxThumbnailURLInfo).toBeCalled();
      expect(imageInfo).toEqual({});
    });
  });
  describe('switchPreImage()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should load data then switch to PreImage', (done: jest.DoneCallback) => {
      const vm = new ImageViewerViewModel({
        ...props,
        ids: [1],
        currentIndex: 1,
        getCurrentIndex: () => 1,
      });
      const loadMore = jest.spyOn(vm, '_loadMore').mockResolvedValueOnce({});
      const fn2 = jest.spyOn(vm, 'switchPreImage');
      expect(vm.hasPrevious).toBeTruthy();
      vm.switchPreImage();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.OLDER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(2);
        done();
      });
    });
    it('should not switch image if load not more data', (done: jest.DoneCallback) => {
      const vm = new ImageViewerViewModel({
        ...props,
        ids: [1],
        currentIndex: 1,
        getCurrentIndex: () => 1,
      });
      const loadMore = jest.spyOn(vm, '_loadMore').mockResolvedValueOnce(null);
      const fn2 = jest.spyOn(vm, 'switchPreImage');
      expect(vm.hasPrevious).toBeTruthy();
      vm.switchPreImage();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.OLDER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(1);
        done();
      });
    });
    it('should update index directly when ids has pre image', () => {
      const updateCurrentItemIndex = jest.fn();
      const vm = new ImageViewerViewModel({
        ...props,
        updateCurrentItemIndex,
        ids: [3, 2],
        currentItemId: 2,
        currentIndex: 1,
        getCurrentIndex: () => 1,
        getCurrentItemId: () => 2,
      });
      expect(vm.hasPrevious).toBeTruthy();
      vm.switchPreImage();
      expect(updateCurrentItemIndex).toBeCalled();
    });
  });
  describe('switchNextImage()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should load data then switch to NextImage', (done: jest.DoneCallback) => {
      const vm = new ImageViewerViewModel({
        ...props,
        total: 3,
        ids: [1],
        currentIndex: 1,
        getCurrentIndex: () => 1,
      });
      const loadMore = jest.spyOn(vm, '_loadMore').mockResolvedValueOnce({});
      const fn2 = jest.spyOn(vm, 'switchNextImage');
      expect(vm.hasNext).toBeTruthy();
      vm.switchNextImage();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.NEWER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(2);
        done();
      });
    });
    it('should not switch image if load not more data', (done: jest.DoneCallback) => {
      const vm = new ImageViewerViewModel({
        ...props,
        total: 3,
        ids: [1],
        currentIndex: 1,
        getCurrentIndex: () => 1,
      });
      const loadMore = jest.spyOn(vm, '_loadMore').mockResolvedValueOnce(null);
      const fn2 = jest.spyOn(vm, 'switchNextImage');
      expect(vm.hasNext).toBeTruthy();
      vm.switchNextImage();
      expect(loadMore).toBeCalledWith(QUERY_DIRECTION.NEWER);
      expect(fn2).toBeCalledTimes(1);
      setTimeout(() => {
        expect(fn2).toBeCalledTimes(1);
        done();
      });
    });
    it('should update index directly when ids has next image', () => {
      const updateCurrentItemIndex = jest.fn();
      const vm = new ImageViewerViewModel({
        ...props,
        updateCurrentItemIndex,
        total: 3,
        ids: [2, 3],
        currentItemId: 2,
        currentIndex: 0,
        getCurrentIndex: () => 0,
        getCurrentItemId: () => 2,
      });
      expect(vm.hasNext).toBeTruthy();
      vm.switchNextImage();
      expect(updateCurrentItemIndex).toBeCalled();
    });
  });
});
