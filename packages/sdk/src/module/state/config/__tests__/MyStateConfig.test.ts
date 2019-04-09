/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-02 17:27:18
 * Copyright © RingCentral. All rights reserved.
 */

import { MyStateConfig } from '../MyStateConfig';
import { CONFIG_KEYS } from '../ConfigKeys';
import { UserConfigService, GlobalConfigService } from '../../../config';
import { ServiceConfig, ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../config/service/GlobalConfigService');

describe('MyStateConfig', () => {
  let stateConfig: MyStateConfig;
  let userConfigService: UserConfigService;
  const MODULE = 'config';
  function setUp() {
    userConfigService = new UserConfigService();
    userConfigService.setUserId = jest.fn();

    const mockConfigService = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
    };

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.USER_CONFIG_SERVICE) {
          return userConfigService;
        }
        return mockConfigService;
      });

    stateConfig = new MyStateConfig();
  }

  beforeEach(() => {
    setUp();
  });

  it('should call get when try to getMyStateId', () => {
    userConfigService.get = jest.fn().mockImplementation(() => {
      return 1;
    });

    stateConfig.getMyStateId();
    expect(userConfigService.get).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.MY_STATE_ID,
    );
  });

  it('should call put when try to setMyStateId', () => {
    userConfigService.put = jest.fn().mockImplementation(() => {});
    stateConfig.setMyStateId(1234);
    expect(userConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.MY_STATE_ID,
      1234,
    );
  });
});
