/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-02 17:47:59
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RcInfoCommonGlobalConfig,
  RC_INFO_COMMON_CONFIG_KEYS,
} from '../RcInfoCommonGlobalConfig';
import { GlobalConfigService } from '../../../config';

jest.mock('../../../config/service/GlobalConfigService');

describe('RcInfoCommonGlobalConfig', () => {
  let mockConfigService;
  const MODULE = 'config';
  beforeAll(() => {
    mockConfigService = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
    };
    GlobalConfigService.getInstance = jest
      .fn()
      .mockReturnValue(mockConfigService);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call get when try to getEnv', () => {
    RcInfoCommonGlobalConfig.getPhoneData();
    expect(mockConfigService.get).toHaveBeenCalledWith(
      MODULE,
      RC_INFO_COMMON_CONFIG_KEYS.PHONE_DATA,
    );
  });

  it('should call put when try to setEnv', () => {
    RcInfoCommonGlobalConfig.setPhoneData('TEST');
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      RC_INFO_COMMON_CONFIG_KEYS.PHONE_DATA,
      'TEST',
    );
  });
});
