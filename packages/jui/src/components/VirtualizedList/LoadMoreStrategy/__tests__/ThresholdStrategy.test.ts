/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-09 15:33:22
 * Copyright © RingCentral. All rights reserved.
 */

import { ThresholdStrategy } from '../ThresholdStrategy';

describe('PostViewDao', () => {
  let strategy: ThresholdStrategy;

  function setup() {
    strategy = new ThresholdStrategy({ threshold: 40, minBatchCount: 20 }, { direction: 'up', count: 20 });
  }

  function clearMocks() {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  }

  describe('updatePreloadCount()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should preload 50 if unread (count - 20 + 1) > 50', () => {
      strategy.updatePreloadCount(80);
      const preloadInfo = strategy.getPreloadInfo();
      expect(preloadInfo && preloadInfo.count).toEqual(50);
    });

    it('should preload 20 if unread (count - 20 + 1) < 40', () => {
      strategy.updatePreloadCount(30);
      const preloadInfo = strategy.getPreloadInfo();
      expect(preloadInfo && preloadInfo.count).toEqual(20);
    });

    it('should preload (count - 20 + 1) if (count - 20 + 1) <= 50 and (count - 20 + 1) >=20 ', () => {
      strategy.updatePreloadCount(39);
      const miniPreloadInfo = strategy.getPreloadInfo();
      expect(miniPreloadInfo && miniPreloadInfo.count).toEqual(20);

      strategy.updatePreloadCount(79);
      const maxPreloadInfo = strategy.getPreloadInfo();
      expect(maxPreloadInfo && maxPreloadInfo.count).toEqual(50);

      strategy.updatePreloadCount(60);
      const normalPreloadInfo = strategy.getPreloadInfo();
      expect(normalPreloadInfo && normalPreloadInfo.count).toEqual(41);
    });
  });
});
