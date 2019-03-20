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
import { ItemService } from 'sdk/module/item/service';
import { Pal } from 'sdk/pal';
import FileItemModel from '@/store/models/FileItem';

const palInstance = {
  getImageDownloader: () => {
    return {
      download: jest.fn(),
    };
  },
};
const itemService = {
  getThumbsUrlWithSize: () => {
    return Promise.resolve('');
  },
};
jest.mock('@/common/getThumbnailURL');
jest.mock('sdk/module/item/module/file/utils');
jest.mock('sdk/api');
jest.mock('sdk/pal');
jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
  };
});
jest.mock('sdk/module/item/service');
ItemService.getInstance = () => itemService;
Pal.getInstance = () => palInstance;
jest.mock('@/common/getThumbnailURL', () => {
  return {
    getMaxThumbnailURLInfo: jest.fn(),
  };
});
describe('ImageViewer.ViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // ItemService.getInstance.mockReturnValue(itemService);
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
    loadMore: jest.fn(),
    setOnCurrentItemDeletedCb: jest.fn(),
    initialOptions: {
      thumbnailSrc: 'xxx',
      initialWidth: 11,
      initialHeight: 22,
    },
    setOnItemSwitchCb: jest.fn(),
    switchToPrevious: jest.fn(),
    switchToNext: jest.fn(),
    hasPrevious: true,
    hasNext: true,
  };
  describe('constructor', () => {
    it('should successfully construct', () => {
      const vm = new ImageViewerViewModel(props);
      vm.imageHeight;
      vm.imageWidth;
      vm.imageUrl;
      vm.item;
      vm.props.getCurrentIndex.mockReturnValue(22);
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
        thumbs: {},
      } as FileItemModel;
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
    it('should try to generate thumbnail when not exist', (done: jest.DoneCallback) => {
      const vm = new ImageViewerViewModel(props);
      const item = {
        downloadUrl: '',
        origWidth: 1,
        origHeight: 2,
      };
      getEntity.mockReturnValue(item);
      const spy = jest.spyOn(itemService, 'getThumbsUrlWithSize');
      FileItemUtils.isSupportShowRawImage.mockReturnValue(false);
      FileItemUtils.isSupportPreview.mockReturnValue(true);
      // getMaxThumbnailURLInfo.mockReturnValue({});
      const imageInfo = vm.imageInfo;
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).toBeCalled();
      expect(getMaxThumbnailURLInfo).not.toBeCalled();
      setTimeout(() => {
        expect(spy).toBeCalled();
        done();
      });
    });
  });
});
