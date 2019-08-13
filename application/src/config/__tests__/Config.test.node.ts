/*
 * @Author: Paynter Chen
 * @Date: 2019-04-06 10:26:16
 * Copyright © RingCentral. All rights reserved.
 */

import { AppEnvSetting } from 'sdk/module/env';
import _ from 'lodash';
import { Config } from '../Config';
import { DirectoryConfig } from '../types';
import { ApiConfig } from 'sdk/types';
import { parseDirectoryConfig } from '../requireUtil';
jest.mock('../requireUtil', () => {
  return {
    parseDirectoryConfig: jest.fn(),
  };
});

jest.mock('sdk/module/env', () => {
  const mockAppEnvSetting = {
    getEnv: jest.fn(),
  };
  return {
    AppEnvSetting: mockAppEnvSetting,
  };
});

describe('config', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    const mockDirectoryConfig: DirectoryConfig = {
      api: {
        default: {} as ApiConfig,
        xm1: {},
        xm2: {},
      },
      db: {
        default: {
          adapter: 'dexie',
        },
      },
    };
    (parseDirectoryConfig as jest.Mock).mockReturnValue(mockDirectoryConfig);
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });
  describe('getEnv()', () => {
    it('should return env ', () => {
      (AppEnvSetting.getEnv as jest.Mock).mockReturnValue('xm1');
      const config = new Config();
      expect(config.getEnv()).toEqual('xm1');
      expect(AppEnvSetting.getEnv).toBeCalled();
    });
  });
  describe('isProductionAccount()', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
    it('should return true if is public build ', () => {
      process.env = {
        JUPITER_ENV: 'public',
        ...OLD_ENV,
      };
      const config = new Config();
      expect(config.isProductionAccount()).toBeTruthy();
    });
    it('should return true if production server config is selected in production build', () => {
      process.env = {
        JUPITER_ENV: 'production',
        ...OLD_ENV,
      };
      const config = new Config();
      expect(config.isProductionAccount()).toBeTruthy();
    });

    it('should return true if production server config is selected if is not production build', () => {
      process.env = {
        JUPITER_ENV: 'test',
        ...OLD_ENV,
      };
      (AppEnvSetting.getEnv as jest.Mock).mockReturnValue('production');
      const config = new Config();
      expect(config.isProductionAccount()).toBeTruthy();
    });
    it('should return false in other cases', () => {
      (AppEnvSetting.getEnv as jest.Mock).mockReturnValue('xm1');
      const config = new Config();
      expect(config.isProductionAccount()).toBeFalsy();
    });
  });
  describe('getAllEnv()', () => {
    it('should return env parse form DirectoryConfig', () => {
      const mockDirectoryConfig: DirectoryConfig = {
        api: {
          default: {} as ApiConfig,
          xm1: {},
          xm2: {},
        },
        db: {
          default: {
            adapter: 'dexie',
          },
        },
      };
      (parseDirectoryConfig as jest.Mock).mockReturnValue(mockDirectoryConfig);
      const config = new Config();
      jest.spyOn(config, 'isProductionBuild').mockReturnValue(true);
      expect(config.getAllEnv()).toEqual(['xm1', 'xm2']);
    });
    it('should return env combine form DirectoryConfig', () => {
      const mockDirectoryConfig: DirectoryConfig = {
        api: {
          default: {} as ApiConfig,
          xm1: {},
          xm2: {},
        },
        db: {
          default: {
            adapter: 'dexie',
          },
          xm3: {
            adapter: 'dexie',
          },
        },
      };
      (parseDirectoryConfig as jest.Mock).mockReturnValue(mockDirectoryConfig);
      const config = new Config();
      jest.spyOn(config, 'isProductionBuild').mockReturnValue(true);
      expect(config.getAllEnv()).toEqual(['xm1', 'xm2', 'xm3']);
    });
  });
  describe('get()', () => {
    it('should get from DirectoryConfig', () => {
      const mockDirectoryConfig: DirectoryConfig = {
        api: {
          default: {
            glip: {},
          } as ApiConfig,
          xm1: {
            glip_desktop: {},
          },
          xm2: {},
        },
        db: {
          default: {
            adapter: 'dexie',
          },
          xm3: {
            adapter: 'dexie',
          },
        },
      };
      (parseDirectoryConfig as jest.Mock).mockReturnValue(mockDirectoryConfig);
      (AppEnvSetting.getEnv as jest.Mock).mockReturnValue('xm1');
      const config = new Config();
      const apiConfig = config.get('api');
      const dbConfig = config.get('db');
      // merge with default
      expect(apiConfig).toEqual(
        _.merge(
          mockDirectoryConfig.api.default,
          mockDirectoryConfig.api['xm1'],
        ),
      );
      // db has not xm1 config, should get the default
      expect(dbConfig).toEqual(mockDirectoryConfig.db.default);
    });
  });
});
