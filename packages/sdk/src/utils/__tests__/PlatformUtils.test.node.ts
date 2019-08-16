/*
 * @Author: lewi.li
 * @Date: 2019-04-10 10:18:52
 * Copyright © RingCentral. All rights reserved.
 */
import { PlatformUtils } from '../PlatformUtils';
import { IApplicationInfo } from '../../pal/applicationInfo';
import { Pal } from '../../pal';

jest.mock('ua-parser-js', () => {
  return {
    UAParser: () => ({
      getBrowser: () => ({
        name: 'WebKit',
        version: '537.36',
      }),
    }),
  };
});
jest.mock('../../pal/pal', () => {
  const mockPal: Pal = {
    getApplicationInfo: jest.fn(),
    getErrorReporter: jest.fn(),
  };
  Object.defineProperty(mockPal, 'instance', {
    get: () => {
      return mockPal;
    },
  });
  return {
    Pal: mockPal,
  };
});
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
describe('PlatformUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('getUserAgent', () => {
    beforeEach(() => {
      const mockAppInfo: IApplicationInfo = {
        appVersion: '1.3.1',
        os: 'mac',
        browser: 'chrome',
        platform: 'desktop',
        env: 'prod',
      };
      (Pal.instance.getApplicationInfo as jest.Mock).mockReturnValue(
        mockAppInfo,
      );
    });
    it('should return user agent when it is web version', () => {
      const result = PlatformUtils.getRCUserAgent();
      expect(result).toBe('RingCentral Jupiter Web/1.3.1/WebKit-537.36');
    });
    it('should return user agent when it is electron version', () => {
      Object.defineProperty(window, 'jupiterElectron', {
        get: () => {
          return {
            getElectronVersionInfo: jest.fn().mockReturnValue({
              electronVersion: '5.0.0',
              electronAppVersion: '1.0.47',
            }),
          };
        },
      });
      const result = PlatformUtils.getRCUserAgent();
      expect(result).toBe('RingCentral Jupiter DT/1.3.1-1.0.47/Electron-5.0.0');
    });
  });
});
