/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-15 09:47:29
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfigService, GlobalConfigService } from '../../../config';
import { TelephonyUserConfig } from '../TelephonyUserConfig';

jest.mock('../../../config/service/UserConfigService');
jest.mock('../../../config/service/GlobalConfigService');

describe('TelephonyUserConfig', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }
  let telephonyConfig;
  const mockConfigService = {
    put: jest.fn(),
    setUserId: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  };
  const USERID = '123';
  const MODULE = 'telephony';
  const KEY = 'test';
  const VALUE = 'abc';

  beforeEach(() => {
    clearMocks();
    GlobalConfigService.getInstance = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue(USERID),
    });
    UserConfigService.getInstance = jest
      .fn()
      .mockReturnValue(mockConfigService);
    telephonyConfig = new TelephonyUserConfig();
  });

  describe('putConfig', () => {
    it('Should call user config put function', () => {
      telephonyConfig.putConfig(KEY, VALUE);
      expect(mockConfigService.put).toHaveBeenCalledWith(MODULE, KEY, VALUE);
    });
  });

  describe('getConfig', () => {
    it('Should call user config get function ', () => {
      telephonyConfig.getConfig(KEY);
      expect(mockConfigService.get).toHaveBeenCalledWith(MODULE, KEY);
    });
  });

  describe('removeConfig', () => {
    it('Should call user config remove function', () => {
      telephonyConfig.removeConfig(KEY);
      expect(mockConfigService.remove).toHaveBeenCalledWith(MODULE, KEY);
    });
  });
});
