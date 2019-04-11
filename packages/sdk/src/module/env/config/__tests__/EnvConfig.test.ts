/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-27 18:29:44
 * Copyright © RingCentral. All rights reserved.
 */

import { EnvConfig } from '../EnvConfig';
import { CONFIG_KEYS } from '../ConfigKeys';
import { GlobalConfigService } from '../../../config';
import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../config/service/GlobalConfigService');

describe('EnvConfig', () => {
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
    EnvConfig.getEnv();
    expect(mockConfigService.get).toHaveBeenCalledWith(MODULE, CONFIG_KEYS.ENV);
  });

  it('should call put when try to setEnv', () => {
    EnvConfig.setEnv('TEST');
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.ENV,
      'TEST',
    );
  });
});
