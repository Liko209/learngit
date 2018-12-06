/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 09:17:15
 * Copyright © RingCentral. All rights reserved.
 */

import { getGlobalValue } from '../../../../store/utils';
import { NetworkBannerViewModel } from '../NetworkBanner.ViewModel';
jest.mock('../../../../store/utils');

describe('NetworkBanner.ViewModel', () => {
  describe('config()', () => {
    it('should return online config when online [JPT-470] 2', () => {
      (getGlobalValue as jest.Mock).mockReturnValueOnce('online');
      const viewModel = new NetworkBannerViewModel();
      const config = viewModel.config;
      expect(config.shouldShow).toBe(false);
    });
    it('should return offline config when offline [JPT-470] 1', () => {
      (getGlobalValue as jest.Mock).mockReturnValueOnce('offline');
      const viewModel = new NetworkBannerViewModel();
      const config = viewModel.config;
      expect(config.shouldShow).toBe(true);
      expect(config.type).toBe('error');
      expect(config.message).toBe('NoInternetConnection');
    });
  });
});
