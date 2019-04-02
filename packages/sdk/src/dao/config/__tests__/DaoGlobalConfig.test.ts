/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-28 14:30:28
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from '../../../module/config';
import { DaoGlobalConfig } from '../DaoGlobalConfig';
import { CONFIG_KEYS } from '../ConfigKeys';

jest.mock('../../../module/config/service/GlobalConfigService');

describe('EnvConfig', () => {
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

  it('should call get when try to getDBSchemaVersion', () => {
    DaoGlobalConfig.getDBSchemaVersion();
    expect(mockConfigService.get).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_SCHEMA_VERSION,
    );
  });

  it('should call put when try to setDBSchemaVersion', () => {
    DaoGlobalConfig.setDBSchemaVersion(1);
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_SCHEMA_VERSION,
      1,
    );
  });

  it('should call get when try to getDBBlockMessageKey', () => {
    DaoGlobalConfig.getDBBlockMessageKey();
    expect(mockConfigService.get).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_BLOCK_MESSAGE_KEY,
    );
  });

  it('should call put when try to setDBBlockMessageKey', () => {
    DaoGlobalConfig.setDBBlockMessageKey(1);
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_BLOCK_MESSAGE_KEY,
      1,
    );
  });

  it('should call remove when try to removeDBBlockMessageKey', () => {
    DaoGlobalConfig.removeDBBlockMessageKey();
    expect(mockConfigService.remove).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_BLOCK_MESSAGE_KEY,
    );
  });
});
