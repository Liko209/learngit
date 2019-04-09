/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-27 18:39:48
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from '../../../config';
import { AppEnvSetting } from '../AppEnvSetting';
import { CONFIG_KEYS } from '../../config';
import { AccountService } from '../../../../module/account';
import { ServiceLoader } from '../../../serviceLoader';

const accountService = {
  logout: jest.fn(),
};

class EnvSwitchedListenerTest {
  onEnvBeforeSwitched = jest.fn();
  onEnvAfterSwitched = jest.fn();
}

describe('AppEnvSetting', () => {
  let mockConfigService;
  const MODULE = 'config';
  beforeAll(() => {
    mockConfigService = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockConfigService);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call get when try to getEnv', () => {
    AppEnvSetting.getEnv();
    expect(mockConfigService.get).toHaveBeenCalledWith(MODULE, CONFIG_KEYS.ENV);
  });

  it('should call put when try to setEnv', () => {
    AppEnvSetting.setEnv('TEST');
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.ENV,
      'TEST',
    );
  });

  it('should call listener when switch env', async () => {
    mockConfigService.get.mockReturnValue('TEST1');
    await AppEnvSetting.switchEnv('TEST2', accountService as AccountService);
    expect(accountService.logout).toBeCalledTimes(1);
  });
});
