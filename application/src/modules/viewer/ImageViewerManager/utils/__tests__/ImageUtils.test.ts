/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-15 19:05:39
 * Copyright © RingCentral. All rights reserved.
 */

import { ImageUtils } from '../ImageUtils';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import FileItemModel from '@/store/models/FileItem';

jest.mock('sdk/module/item/module/file/utils');
jest.mock('@/common/getThumbnailURL', () => {
  return {
    getMaxThumbnailURLInfo: jest.fn(),
  };
});

describe('ImageUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('imageInfo', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call isSupportShow', () => {
      const item = {
        versionUrl: '',
        origWidth: 1,
        origHeight: 2,
      } as FileItemModel;
      FileItemUtils.isSupportShowRawImage.mockReturnValue(false);
      FileItemUtils.isSupportPreview.mockReturnValue(false);

      const imageInfo = ImageUtils.fileImageInfo(item);
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).toBeCalled();
      expect(imageInfo).toEqual({
        url: undefined,
        width: 0,
        height: 0,
      });
    });
    it('should return raw image info when support', () => {
      const item = {
        versionUrl: 'about:blank',
        origWidth: 1,
        origHeight: 2,
      } as FileItemModel;
      FileItemUtils.isSupportShowRawImage.mockReturnValue(true);

      const imageInfo = ImageUtils.fileImageInfo(item);
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).not.toBeCalled();
      expect(imageInfo).toEqual({
        url: item.versionUrl,
        width: item.origWidth,
        height: item.origHeight,
      });
    });
    it('should return thumbnail image when support', () => {
      const item = {
        downloadUrl: '',
        origWidth: 1,
        origHeight: 2,
        thumbs: {},
      } as FileItemModel;
      FileItemUtils.isSupportShowRawImage.mockReturnValue(false);
      FileItemUtils.isSupportPreview.mockReturnValue(true);
      getMaxThumbnailURLInfo.mockReturnValue({});

      const imageInfo = ImageUtils.fileImageInfo(item);
      expect(FileItemUtils.isSupportShowRawImage).toBeCalled();
      expect(FileItemUtils.isSupportPreview).toBeCalled();
      expect(getMaxThumbnailURLInfo).toBeCalled();
      expect(imageInfo).toEqual({});
    });
  });
});
