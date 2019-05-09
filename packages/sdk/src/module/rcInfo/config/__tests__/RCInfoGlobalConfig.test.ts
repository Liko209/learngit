/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-08 17:24:36
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoGlobalConfig } from '../RCInfoGlobalConfig';
import { RC_INFO_GLOBAL_KEYS } from '../configKeys';
import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../config/service/GlobalConfigService');

describe('RCInfoGlobalConfig', () => {
  let mockGlobalConfigService;
  const MODULE = 'rc_info';
  beforeAll(() => {
    mockGlobalConfigService = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
    };
    ServiceLoader.getInstance = jest
      .fn()
      .mockReturnValue(mockGlobalConfigService);
  });

  it('should call get when getStationLocation', () => {
    RCInfoGlobalConfig.getStationLocation();
    expect(mockGlobalConfigService.get).toHaveBeenCalledWith(
      MODULE,
      RC_INFO_GLOBAL_KEYS.STATION_LOCATION,
    );
  });

  it('should call get when setStationLocation', () => {
    RCInfoGlobalConfig.setStationLocation(123);
    expect(mockGlobalConfigService.put).toHaveBeenCalledWith(
      MODULE,
      RC_INFO_GLOBAL_KEYS.STATION_LOCATION,
      123,
    );
  });
});
