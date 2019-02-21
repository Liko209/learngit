/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 09:17:15
 * Copyright © RingCentral. All rights reserved.
 */

import { getGlobalValue } from '../../../../../../store/utils';
import { NetworkBannerViewModel } from '../NetworkBanner.ViewModel';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';

jest.mock('../../../../../../store/utils');

describe('NetworkBannerViewModel', () => {
  describe('config()', () => {
    it('should return online config when online [JPT-470] 2', () => {
      (getGlobalValue as jest.Mock).mockReturnValueOnce('online');
      const viewModel = new NetworkBannerViewModel();
      expect(viewModel.banner).toBeNull();
    });

    it('should return offline config when offline [JPT-470] 1', () => {
      (getGlobalValue as jest.Mock).mockReturnValueOnce('offline');
      (getGlobalValue as jest.Mock).mockReturnValueOnce('userId');
      const viewModel = new NetworkBannerViewModel();
      expect(viewModel.banner).toEqual({
        message: 'common.prompt.NoInternetConnection',
        type: ToastType.ERROR,
      });
    });

    it('should return NULL config when user has not login', () => {
      (getGlobalValue as jest.Mock).mockReturnValueOnce('offline');
      (getGlobalValue as jest.Mock).mockReturnValueOnce('');
      const viewModel = new NetworkBannerViewModel();
      expect(viewModel.banner).toBeNull();
    });
  });
});
