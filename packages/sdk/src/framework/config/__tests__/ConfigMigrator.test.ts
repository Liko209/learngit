/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-08 20:15:02
 * Copyright © RingCentral. All rights reserved.
 */

import { configMigrator } from '../ConfigMigrator';
import { CONFIG_TYPE } from '../../../module/config/constants';
import { IConfigHistory } from '../IConfigHistory';
import { ConfigChangeHistory } from '../types';

describe('ConfigMigrator', () => {
  const clearAll = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  };

  beforeEach(() => {
    clearAll();
    configMigrator['_isReady'] = false;
    configMigrator['_histories'] = [];
    jest.spyOn(configMigrator, 'init');
    jest.spyOn(configMigrator, '_doDataMigration');
  });

  describe('_doDataMigration', () => {
    it('should do nothing when history is invalid', async () => {
      const history = {} as any;
      configMigrator['_getVersion'] = jest.fn();
      await configMigrator['_doDataMigration'](history);
      expect(configMigrator['_getVersion']).not.toBeCalled();
    });

    it('should do nothing when version is not changed', async () => {
      const history = { version: 12, moduleName: 'test' } as any;
      configMigrator['_getVersion'] = jest.fn().mockReturnValue(12);
      configMigrator['_setVersion'] = jest.fn();
      await configMigrator['_doDataMigration'](history);
      expect(configMigrator['_getVersion']).toBeCalledWith(history.moduleName);
      expect(configMigrator['_setVersion']).not.toBeCalled();
    });

    it('should do migration correctly', async () => {
      const history: ConfigChangeHistory = {
        version: 2,
        moduleName: 'test',
        changes: {
          1: {
            move: [
              {
                from: { type: CONFIG_TYPE.DB, value: 'test1' },
                to: { type: CONFIG_TYPE.DB, value: 'test2' },
              },
            ],
            delete: [{ type: CONFIG_TYPE.DB, value: 'test3' }],
          },
          2: {
            move: [
              {
                from: { type: CONFIG_TYPE.USER, value: 'test4' },
                to: { type: CONFIG_TYPE.GLOBAL, value: 'test5' },
              },
            ],
            delete: [{ type: CONFIG_TYPE.USER, value: 'test6' }],
          },
        },
      };
      const mockDBConfig = {
        get: jest.fn().mockReturnValue('DBValue'),
        put: jest.fn(),
        remove: jest.fn(),
      };
      const mockUserConfig = {
        get: jest.fn().mockReturnValue('UserValue'),
        put: jest.fn(),
        remove: jest.fn(),
      };
      const mockGlobalConfig = {
        get: jest.fn().mockReturnValue('GlobalValue'),
        put: jest.fn(),
        remove: jest.fn(),
      };
      configMigrator['_getConfig'] = jest
        .fn()
        .mockImplementation((type: CONFIG_TYPE) => {
          if (type === CONFIG_TYPE.DB) {
            return mockDBConfig;
          }
          if (type === CONFIG_TYPE.USER) {
            return mockUserConfig;
          }
          if (type === CONFIG_TYPE.GLOBAL) {
            return mockGlobalConfig;
          }
          return;
        });
      configMigrator['_getVersion'] = jest.fn().mockReturnValue(undefined);
      configMigrator['_setVersion'] = jest.fn();
      await configMigrator['_doDataMigration'](history);
      expect(configMigrator['_getVersion']).toBeCalledWith(history.moduleName);
      expect(configMigrator['_setVersion']).toBeCalledTimes(2);
      expect(configMigrator['_setVersion']).toHaveBeenCalledWith('test', 1);
      expect(configMigrator['_setVersion']).toHaveBeenCalledWith('test', 2);

      expect(mockDBConfig.get).toBeCalledTimes(1);
      expect(mockDBConfig.get).toBeCalledWith('test', 'test1');
      expect(mockDBConfig.put).toBeCalledTimes(1);
      expect(mockDBConfig.put).toBeCalledWith('test', 'test2', 'DBValue');
      expect(mockDBConfig.remove).toBeCalledTimes(2);
      expect(mockDBConfig.remove).toHaveBeenCalledWith('test', 'test1');
      expect(mockDBConfig.remove).toHaveBeenCalledWith('test', 'test3');

      expect(mockUserConfig.get).toBeCalledTimes(1);
      expect(mockUserConfig.get).toBeCalledWith('test', 'test4');
      expect(mockUserConfig.put).not.toBeCalled();
      expect(mockUserConfig.remove).toBeCalledTimes(2);
      expect(mockUserConfig.remove).toHaveBeenCalledWith('test', 'test4');
      expect(mockUserConfig.remove).toHaveBeenCalledWith('test', 'test6');

      expect(mockGlobalConfig.get).not.toBeCalled();
      expect(mockGlobalConfig.put).toBeCalledTimes(1);
      expect(mockGlobalConfig.put).toBeCalledWith('test', 'test5', 'UserValue');
      expect(mockGlobalConfig.remove).not.toBeCalled();
    });
  });

  describe('init', () => {
    it('should be called when DB is initialized', async () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };
      configMigrator['_histories'].push(history);

      await configMigrator.init();
      expect(configMigrator['_doDataMigration']).toBeCalledWith(
        history.getHistoryDetail(),
      );
      expect(configMigrator['_isReady']).toBeTruthy();
      expect(configMigrator['_histories']).toEqual([]);
    });
  });

  describe('addDataMigration', () => {
    it('should add to histories when isReady is false', () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };

      configMigrator.addHistory(history);
      expect(configMigrator['_doDataMigration']).not.toBeCalled();
      expect(configMigrator['_isReady']).toBeFalsy();
      expect(configMigrator['_histories'].length).toEqual(1);
    });

    it('should do migration when isReady is true', () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };
      configMigrator['_isReady'] = true;

      configMigrator.addHistory(history);
      expect(configMigrator['_doDataMigration']).toBeCalledWith(
        history.getHistoryDetail(),
      );
      expect(configMigrator['_isReady']).toBeTruthy();
      expect(configMigrator['_histories'].length).toEqual(0);
    });
  });
});
