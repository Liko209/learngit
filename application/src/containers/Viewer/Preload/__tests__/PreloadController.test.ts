/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-14 18:35:51
 * Copyright © RingCentral. All rights reserved.
 */

import { PreloadController } from '../PreloadController';
import { ImageDownloader } from '@/common/ImageDownloader';

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
      };
    },
  };
});
jest.mock('sdk/module/item/service');

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
