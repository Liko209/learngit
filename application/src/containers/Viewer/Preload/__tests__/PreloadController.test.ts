/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:51
 * Copyright © RingCentral. All rights reserved.
 */

import { PreloadController } from '../PreloadController';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { getEntity } from '@/store/utils';
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
      preloadCtrl.replacePreload([0, 1, 2, 3, 4, 5, 6], 3);
      expect(preloadCtrl.getInProgressId()).toEqual(4);
      expect(preloadCtrl.getPendingIds()).toEqual([2, 5, 1]);

      preloadCtrl.stop();
      expect(preloadCtrl.getPendingIds()).toEqual([]);
    });
  });
});
