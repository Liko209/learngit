/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-15 18:08:46
 * Copyright © RingCentral. All rights reserved.
 */

import { UserConfigService } from '../service/UserConfigService';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { UserConfig } from '../UserConfig';

jest.mock('../service/UserConfigService');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('UserConfig', () => {
  let userConfig: UserConfig;
  let userConfigService: UserConfigService;
  function setUp() {
    userConfigService = new UserConfigService();

    const serviceMap = new Map([
      [ServiceConfig.USER_CONFIG_SERVICE, userConfigService],
    ]);
    ServiceLoader.getInstance = jest.fn().mockImplementation((name: string) => {
      return serviceMap.get(name);
    });
    userConfig = new UserConfig('123', 'name');
  }

  describe('get', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should get from cache when has cache', () => {
      userConfig['_configCache'] = new Map([['key', 1]]);
      userConfigService.get = jest.fn();

      const res = userConfig['get']('key');

      expect(res).toEqual(1);
      expect(userConfigService.get).not.toBeCalled();
    });

    it('should get from config service when has no cache', () => {
      userConfig['_configCache'].clear();
      userConfigService.get = jest.fn().mockReturnValue(2);

      const res = userConfig['get']('key');

      expect(res).toEqual(2);
      expect(userConfigService.get).toBeCalledWith('name', 'key');
    });
  });

  describe('put', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should update cache when put', () => {
      userConfigService.put = jest.fn();

      userConfig['put']('key', '1');
      expect(userConfig['_configCache'].get('key')).toEqual('1');
      expect(userConfigService.put).toBeCalledWith('name', 'key', '1');
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should remove cache when call remove', () => {
      userConfigService.remove = jest.fn();
      userConfig['_configCache'] = new Map([['key', 1]]);

      userConfig['remove']('key');

      expect(userConfig['_configCache'].has('key')).toBeFalsy();
      expect(userConfigService.remove).toBeCalledWith('name', 'key');
    });
  });
});
