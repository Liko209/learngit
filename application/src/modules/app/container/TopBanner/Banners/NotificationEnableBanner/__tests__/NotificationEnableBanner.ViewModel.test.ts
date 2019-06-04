/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-04 10:55:33
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationEnableBannerViewModel } from '../NotificationEnableBanner.ViewModel';

jest.mock('@/common/isUserAgent', () => {
  return {
    isElectron: jest.fn().mockReturnValue(false),
  };
});

describe('NotificationEnableBannerViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('isShow', () => {
    it('should return false when in Electron [JPT-2093]', () => {
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isShow).toBe(false);
    });
  });
});
