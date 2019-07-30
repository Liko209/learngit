/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-08 20:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from '../GlobalConfigService';
import { VERSION_KEY } from '../../constants';

describe('GlobalConfigService', () => {
  let configService: GlobalConfigService;

  beforeEach(() => {
    configService = new GlobalConfigService();
  });

  describe('getVersion', () => {
    it('should get correct version', () => {
      const module = 'testName';
      const version = 15;
      configService.get = jest.fn().mockReturnValue(version);
      expect(configService.getVersion(module)).toEqual(version);
      expect(configService.get).toBeCalledWith(module, VERSION_KEY);
    });
  });

  describe('setVersion', () => {
    it('should set correct version', () => {
      const module = 'testName';
      const version = 15;
      configService.put = jest.fn();
      configService.setVersion(module, version);
      expect(configService.put).toBeCalledWith(module, VERSION_KEY, version);
    });
  });
});
