/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 19:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from '../service/GlobalConfigService';
import { GlobalConfig } from '../GlobalConfig';
import { ServiceLoader } from '../../serviceLoader';

jest.mock('../service/GlobalConfigService');

describe('GlobalConfig', () => {
  const TEST = 'test';
  let mockConfigService;
  beforeAll(() => {
    mockConfigService = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockConfigService);
  });
  it('should call get when try to get config', () => {
    GlobalConfig.get(TEST);
    expect(mockConfigService.get).toHaveBeenCalled();
  });

  it('should call put when try to set config', () => {
    GlobalConfig.put(TEST, TEST);
    expect(mockConfigService.put).toHaveBeenCalled();
  });

  it('should call remove when try to remove config', () => {
    GlobalConfig.remove(TEST);
    expect(mockConfigService.remove).toHaveBeenCalled();
  });
});
