/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 09:17:15
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
