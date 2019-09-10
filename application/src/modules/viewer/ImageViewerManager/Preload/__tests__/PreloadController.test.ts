/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:51
 * Copyright © RingCentral. All rights reserved.
 */

import { PreloadController } from '../PreloadController';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { getEntity } from '@/store/utils';
import '@/common/getThumbnailURL';
import FileItemModel from '@/store/models/FileItem';

jest.mock('sdk/module/item/module/file/utils');
jest.mock('sdk/api');
jest.mock('sdk/pal');
jest.mock('@/store/utils', () => {
  return {
    getEntity: jest.fn(),
  };
});
jest.mock('@/common/ImageDownloader', () => {
  return {
    ImageDownloader: () => {
      return {
        download: jest.fn(),
        cancelLoadingImage: jest.fn(),
      };
    },
  };
});
jest.mock('sdk/module/item/service');
jest.mock('@/common/getThumbnailURL', () => {
  return {
    getLargeRawImageURL: jest.fn().mockReturnValue('http://xxx'),
  };
});

const item = {
  versionUrl: 'about:blank',
  origWidth: 1,
  origHeight: 2,
  thumbs: {},
} as FileItemModel;
getEntity.mockReturnValue(item);
FileItemUtils.isSupportShowRawImage.mockReturnValue(true);

describe('PreloadController', () => {
  describe('pending ids', () => {
    it('Should have the prioritized ids around the index', () => {
      const preloadCtrl = new PreloadController();
      preloadCtrl.replacePreload([1, 2, 3, 4, 5, 6, 7], 3);
      expect(preloadCtrl.getInProgressId()).toEqual(0);

      preloadCtrl.setIsAllowed(true);
      expect(preloadCtrl.getInProgressId()).toEqual(5);
      expect(preloadCtrl.getPendingIds()).toEqual([3, 6, 2]);

      preloadCtrl.onSuccess({ id: preloadCtrl.getInProgressId() }, 0, 0);
      expect(preloadCtrl.getInProgressId()).toEqual(3);

      preloadCtrl.stop();
      expect(preloadCtrl.getPendingIds()).toEqual([]);

      preloadCtrl._startPreload();
      expect(preloadCtrl.getPendingIds()).toEqual([]);
    });
  });
});
