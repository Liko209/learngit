/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-08 20:15:02
 * Copyright © RingCentral. All rights reserved.
 */

import { CONFIG_TYPE } from '../../../module/config/constants';
import { IConfigHistory } from '../IConfigHistory';
import { ConfigChangeHistory } from '../types';
import { configMigrator } from '../ConfigMigrator';
import { daoManager } from 'sdk/dao';
import { AccountGlobalConfig } from 'sdk/module/account/config';

describe('ConfigMigrator', () => {
  const clearAll = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  };

  beforeEach(() => {
    clearAll();
    configMigrator['_dbConfigReady'] = false;
    configMigrator['_userConfigReady'] = false;
    configMigrator['_histories'] = [];
    jest.spyOn(configMigrator, 'onDBInitialized');
    jest.spyOn(configMigrator, 'onUserDictionaryUpdate');
    jest.spyOn(configMigrator, 'init');
    jest.spyOn(configMigrator, '_doDataMigration');
    jest.spyOn(configMigrator, '_getConfig');
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
    it('should init when DB and user config is ready', async () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };
      configMigrator['_histories'].push(history);
      configMigrator['_dbConfigReady'] = true;
      configMigrator['_userConfigReady'] = true;

      await configMigrator.init();
      expect(configMigrator['_doDataMigration']).toBeCalledWith(
        history.getHistoryDetail(),
      );
      expect(configMigrator['_histories']).toEqual([]);
    });

    it('should do nothing when DB and user config is not ready', async () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };
      configMigrator['_histories'].push(history);
      configMigrator['_dbConfigReady'] = false;
      configMigrator['_userConfigReady'] = false;

      await configMigrator.init();
      expect(configMigrator['_doDataMigration']).not.toBeCalled();
      expect(configMigrator['_histories']).toEqual([history]);
    });
  });

  describe('addHistory', () => {
    it('should add to histories when DB and user config is not ready', () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };

      configMigrator.addHistory(history);
      expect(configMigrator['_doDataMigration']).not.toBeCalled();
      expect(configMigrator['_histories'].length).toEqual(1);
    });

    it('should do migration when DB and user config is ready', () => {
      const history: IConfigHistory = {
        getHistoryDetail: jest.fn().mockReturnValue({
          version: 1,
          moduleName: 'test',
          changes: [],
        }),
      };
      configMigrator['_dbConfigReady'] = true;
      configMigrator['_userConfigReady'] = true;

      configMigrator.addHistory(history);
      expect(configMigrator['_doDataMigration']).toBeCalledWith(
        history.getHistoryDetail(),
      );
      expect(configMigrator['_histories'].length).toEqual(0);
    });
  });

  describe('onDBInitialized', () => {
    it('should call init', () => {
      configMigrator.init.mockImplementationOnce(() => {});
      daoManager['_notifyDBInitialized']();
      expect(configMigrator.onDBInitialized).toBeCalled();
      expect(configMigrator['_dbConfigReady']).toBeTruthy();
      expect(configMigrator.init).toBeCalled();
    });
  });

  describe('observeUserDictionaryStatus', () => {
    it('should call onUserDictionaryUpdate when UD is valid', () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValue('557');
      configMigrator.onUserDictionaryUpdate.mockImplementationOnce(() => {});
      configMigrator.observeUserDictionaryStatus();
      expect(configMigrator.onUserDictionaryUpdate).toBeCalledWith('557');
    });

    it('should call observeUserDictionary when UD is invalid', () => {
      AccountGlobalConfig.getUserDictionary = jest
        .fn()
        .mockReturnValue(undefined);
      AccountGlobalConfig.observeUserDictionary = jest.fn();
      configMigrator.observeUserDictionaryStatus();
      expect(AccountGlobalConfig.observeUserDictionary).toBeCalled();
    });
  });

  describe('onUserDictionaryUpdate', () => {
    it('should call setUserId and init', () => {
      configMigrator.init.mockImplementationOnce(() => {});
      const mockFunc = jest.fn();
      configMigrator['_getConfig'].mockReturnValue({ setUserId: mockFunc });
      configMigrator.onUserDictionaryUpdate('4556');
      expect(configMigrator['_getConfig']).toBeCalledWith(CONFIG_TYPE.USER);
      expect(mockFunc).toBeCalledWith('4556');
      expect(configMigrator['_userConfigReady']).toBeTruthy();
      expect(configMigrator.init).toBeCalled();
    });
  });
});
