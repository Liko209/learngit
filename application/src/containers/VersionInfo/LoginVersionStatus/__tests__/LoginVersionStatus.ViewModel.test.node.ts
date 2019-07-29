/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-09 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { LoginVersionStatusViewModel } from '../LoginVersionStatus.ViewModel';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';

const mock_versionInfo = {
  buildTime: '',
  buildCommit: '',
  buildVersion: '',
  deployedTime: '1.2.1',
  deployedCommit: '6c2946a',
  deployedVersion: '1554804974000',
};

jest.mock('../../helper', () => {
  return {
    fetchVersionInfo: () => mock_versionInfo,
  };
});

describe('LoginVersionStatus.ViewModel', () => {
  describe('getVersionInfo()', () => {
    it('should get version info', async () => {
      const vm = new LoginVersionStatusViewModel();
      await vm.getVersionInfo();
      expect(vm.versionInfo).toEqual(mock_versionInfo);
    });
  });
  describe('electronVersionInfo()', () => {
    it('should return electron version info', () => {
      const APP_VERSION = '1.0.48 Mac';
      const ELECTRON_VERSION = '4.1.3';
      storeManager.getGlobalStore = jest.fn().mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === GLOBAL_KEYS.ELECTRON_APP_VERSION) {
            return APP_VERSION;
          }
          if (key === GLOBAL_KEYS.ELECTRON_VERSION) {
            return ELECTRON_VERSION;
          }
          return null;
        }),
      });
      const vm = new LoginVersionStatusViewModel();
      expect(vm.electronVersionInfo).toEqual({
        electronAppVersion: APP_VERSION,
        electronVersion: ELECTRON_VERSION,
      });
    });
  });
});
