/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 21:15:18
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalConfigService } from '../../../module/config/service/GlobalConfigService';
import { NewGlobalConfig } from '../NewGlobalConfig';
import { CONFIG_KEYS } from '../configKeys';

jest.mock('../../../module/config/service/GlobalConfigService');

describe('NewGlobalConfig', () => {
  let mockConfigService;
  const MODULE = 'config';
  const TEST = 'test';
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
    NewGlobalConfig.getDBSchemaVersion();
    expect(mockConfigService.get).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_SCHEMA_VERSION,
    );
  });

  it('should call put when try to setDBSchemaVersion', () => {
    NewGlobalConfig.setDBSchemaVersion(1);
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.DB_SCHEMA_VERSION,
      1,
    );
  });

  it('should call get when try to getEnv', () => {
    NewGlobalConfig.getEnv();
    expect(mockConfigService.get).toHaveBeenCalledWith(MODULE, CONFIG_KEYS.ENV);
  });

  it('should call put when try to setEnv', () => {
    NewGlobalConfig.setEnv(TEST);
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.ENV,
      TEST,
    );
  });

  it('should call get when try to getStaticHttpServer', () => {
    NewGlobalConfig.getStaticHttpServer();
    expect(mockConfigService.get).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.STATIC_HTTP_SERVER,
    );
  });

  it('should call put when try to setStaticHttpServer', () => {
    NewGlobalConfig.setStaticHttpServer(TEST);
    expect(mockConfigService.put).toHaveBeenCalledWith(
      MODULE,
      CONFIG_KEYS.STATIC_HTTP_SERVER,
      TEST,
    );
  });

  it('should call get when try to getConfig', () => {
    NewGlobalConfig.getConfig(TEST);
    expect(mockConfigService.get).toHaveBeenCalledWith(MODULE, TEST);
  });

  it('should call put when try to putConfig', () => {
    NewGlobalConfig.putConfig(TEST, '123');
    expect(mockConfigService.put).toHaveBeenCalledWith(MODULE, TEST, '123');
  });

  it('should call remove when try to removeConfig', () => {
    NewGlobalConfig.removeConfig(TEST);
    expect(mockConfigService.remove).toHaveBeenCalledWith(MODULE, TEST);
  });
});
