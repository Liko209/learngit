/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-21 15:35:28
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable spaced-comment */
/// <reference path="./types.d.ts" />
import { NetworkManager } from 'foundation/network';
import { mainLogger } from 'foundation/log';
import Foundation from 'foundation/Foundation';

import Sdk from '../Sdk';
import { Api, HandleByRingCentral, HandleByGlip } from '../api';
import { daoManager } from '../dao';
import { ServiceManager, AccountManager } from '../framework';
import notificationCenter from '../service/notificationCenter';
import { SERVICE } from '../service/eventKey';
import { SyncService } from '../module/sync/service/SyncService';
import { ServiceLoader, ServiceConfig } from '../module/serviceLoader';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';
import { PermissionService } from 'sdk/module/permission/service/PermissionService';
import { jobScheduler } from 'sdk/framework/utils/jobSchedule';

import { UserConfigService } from 'sdk/module/config/service/UserConfigService';
import { AccountGlobalConfig } from 'sdk/module/account/config/AccountGlobalConfig';
import { CrashManager } from 'sdk/module/crash/CrashManager';
import { EnvConfig } from '../module/env/config';
import { dataAnalysis } from 'foundation/analysis';

jest.mock('../module/config/UserConfig');
jest.mock('../module/config/GlobalConfig');
jest.mock('../module/sync/service/SyncService');
jest.mock('../dao');
jest.mock('../api');
jest.mock('../utils/phoneParser');
jest.mock('../framework');
jest.mock('../service/notificationCenter');
jest.mock('foundation/src/analysis');
jest.mock('foundation/network/NetworkManager');
jest.mock('sdk/module/crash/CrashManager');
jest.mock('../module/env/config')
jest.mock('foundation/analysis')
window.addEventListener = jest.fn();
window.removeEventListener = jest.fn();
describe('Sdk', () => {
  let sdk: Sdk;
  let accountManager: AccountManager;
  let serviceManager: ServiceManager;
  let networkManager: NetworkManager;
  let syncService: SyncService;
  let permissionService: PermissionService;
  const mockAccountService = {
    startLoginGlip: jest.fn(),
    userConfig: {
      getAccountType: jest.fn(),
    },
    authUserConfig: {
      getRCToken: jest.fn(),
      getGlipToken: jest.fn(),
    },
  };
  const crashManager: CrashManager = {
    monitor: jest.fn(),
    dispose: jest.fn(),
    onCrash: jest.fn(),
  } as any;
  CrashManager.getInstance = () => crashManager;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
    accountManager = new AccountManager(null);
    serviceManager = new ServiceManager(null);
    networkManager = new NetworkManager();
    jest.spyOn(networkManager, 'clearToken');
    syncService = new SyncService();
    syncService.userConfig = { clearSyncConfigsForDBUpgrade: jest.fn() } as any;
    permissionService = new PermissionService();
    Object.assign(Api, {
      httpConfig: {
        segment: ""
      }
    })
    sdk = new Sdk(
      daoManager,
      accountManager,
      serviceManager,
      networkManager,
      syncService,
      permissionService,
    );
  });

  describe('init()', () => {
    it('should check login status and subscribe notifications', async () => {
      accountManager.syncLogin = jest.fn().mockReturnValueOnce({
        isRCOnlyMode: false,
        success: true,
      });
      accountManager.on = jest.fn();
      jest.spyOn(Foundation, 'init');
      EnvConfig.getIsRunningE2E.mockReturnValueOnce(false);
      dataAnalysis.init.mockReturnValueOnce('');
      await sdk.init({ api: {}, db: {} });
      expect(Foundation.init).toHaveBeenCalled();
      expect(Api.init).toHaveBeenCalled();
      expect(notificationCenter.on).toHaveBeenCalledTimes(1);
      expect(accountManager.on).toHaveBeenCalledTimes(4);
      expect(accountManager.syncLogin).toHaveBeenCalledTimes(1);
      expect(crashManager.monitor).toHaveBeenCalledTimes(1);
      expect(dataAnalysis.init).toHaveBeenCalled();
    });
  });

  describe('onStartLogin()', () => {
    it('should init all module', async () => {
      sdk['_sdkConfig'] = { api: {}, db: {} };
      await sdk.onStartLogin();
      expect(daoManager.initDatabase).toHaveBeenCalled();
      expect(serviceManager.startService).toHaveBeenCalled();
      expect(HandleByRingCentral.platformHandleDelegate).toEqual(
        mockAccountService,
      );
      expect(HandleByGlip.platformHandleDelegate).toEqual(mockAccountService);
    });
  });

  describe('onAuthSuccess()', () => {
    beforeEach(() => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(sdk, 'updateNetworkToken').mockImplementation(() => { });
      PhoneParserUtility.loadModule = jest.fn();
    });
    afterEach(() => jest.restoreAllMocks());
    it('should init networkManager, PhoneParserUtility ,and sync data when first login', async () => {
      syncService.syncData.mockImplementation(() => { });
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: true,
      } as any);
      expect(sdk.updateNetworkToken).toHaveBeenCalled();
      expect(accountManager.updateSupportedServices).toHaveBeenCalled();
      expect(PhoneParserUtility.loadModule).toHaveBeenCalled();
      expect(syncService.syncData).toHaveBeenCalled();
    });
    it('should not sync data when in rc only mode', async () => {
      syncService.syncData.mockImplementation(() => { });
      await sdk.onAuthSuccess({
        isRCOnlyMode: true,
        isFirstLogin: true,
      } as any);
      expect(sdk.updateNetworkToken).toHaveBeenCalled();
      expect(accountManager.updateSupportedServices).toHaveBeenCalled();
      expect(PhoneParserUtility.loadModule).toHaveBeenCalled();
      expect(syncService.syncData).not.toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.RC_LOGIN, {isFirstLogin: true, success: true}
      );
    });
    it('should notify glip login when timestamp is valid and isFirstLogin is false', async () => {
      syncService.syncData.mockImplementation(() => { });
      syncService.getIndexTimestamp.mockReturnValue(123);
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: false,
      } as any);
      expect(sdk.updateNetworkToken).toHaveBeenCalled();
      expect(accountManager.updateSupportedServices).toHaveBeenCalled();
      expect(PhoneParserUtility.loadModule).toHaveBeenCalled();
      expect(syncService.syncData).toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.GLIP_LOGIN,
        { success: true, isFirstLogin: false },
      );
    });
    it('should notify rc login when account type is rc and isFirstLogin is false', async () => {
      syncService.syncData.mockImplementation(() => { });
      mockAccountService.userConfig.getAccountType.mockReturnValue(
        ACCOUNT_TYPE_ENUM.RC,
      );
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: false,
      } as any);
      expect(sdk.updateNetworkToken).toHaveBeenCalled();
      expect(accountManager.updateSupportedServices).toHaveBeenCalled();
      expect(PhoneParserUtility.loadModule).toHaveBeenCalled();
      expect(syncService.syncData).toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.RC_LOGIN,
        { success: true, isFirstLogin: false },
      );
    });
    it('should notify start loading when timestamp is inValid and isFirstLogin is false', async () => {
      syncService.syncData.mockImplementation(() => { });
      syncService.getIndexTimestamp.mockReturnValue(undefined);
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: false,
      } as any);
      expect(sdk.updateNetworkToken).toHaveBeenCalled();
      expect(accountManager.updateSupportedServices).toHaveBeenCalled();
      expect(PhoneParserUtility.loadModule).toHaveBeenCalled();
      expect(syncService.syncData).toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.START_LOADING,
      );
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.STOP_LOADING,
      );
    });
  });

  describe('onLogout()', () => {
    beforeEach(async () => {
      ServiceLoader.getInstance = jest
        .fn()
        .mockReturnValue({ clear: jest.fn() });
      await sdk.onLogout();
    });

    it('should clear UserConfig', () => {
      const userConfigService = ServiceLoader.getInstance<UserConfigService>(
        ServiceConfig.USER_CONFIG_SERVICE,
      );
      expect(userConfigService.clear).toHaveBeenCalled();
    });
    it('should clear networkManager token', () => {
      expect(networkManager.clearToken).toHaveBeenCalled();
    });
    it('should stop all service', () => {
      expect(serviceManager.stopAllServices).toHaveBeenCalled();
    });
    it('should clear database', () => {
      expect(daoManager.deleteDatabase).toHaveBeenCalled();
    });
    it('should dispose crashManager', () => {
      expect(crashManager.dispose).toHaveBeenCalled();
    });
  });

  describe('updateServiceStatus()', () => {
    it('should call start services', () => {
      sdk.updateServiceStatus(['AService'], true);
      expect(serviceManager.startServices).toHaveBeenCalledWith(['AService']);
    });

    it('should call stop services', () => {
      sdk.updateServiceStatus(['AService'], false);
      expect(serviceManager.stopServices).toHaveBeenCalledWith(['AService']);
    });
  });

  describe('clearAllData()', () => {
    it('should delete Database and config', async () => {
      sdk.daoManager.deleteDatabase = jest.fn();
      AccountGlobalConfig.getUserDictionary.mockReturnValue('test');
      sdk.syncService.userConfig.clearSyncConfigsForDBUpgrade = jest.fn();
      jobScheduler.userConfig.clearFetchDataConfigs = jest.fn();
      await sdk.clearAllData();
      expect(sdk.daoManager.deleteDatabase).toHaveBeenCalled();
      expect(AccountGlobalConfig.getUserDictionary).toHaveBeenCalled();
      expect(
        sdk.syncService.userConfig.clearSyncConfigsForDBUpgrade,
      ).toHaveBeenCalled();
      expect(jobScheduler.userConfig.clearFetchDataConfigs).toHaveBeenCalled();
    });

    it('should not delete config when UD is invalid', async () => {
      sdk.daoManager.deleteDatabase = jest.fn();
      AccountGlobalConfig.getUserDictionary.mockReturnValue(undefined);
      sdk.syncService.userConfig.clearSyncConfigsForDBUpgrade = jest.fn();
      jobScheduler.userConfig.clearFetchDataConfigs = jest.fn();
      await sdk.clearAllData();
      expect(sdk.daoManager.deleteDatabase).toHaveBeenCalled();
      expect(AccountGlobalConfig.getUserDictionary).toHaveBeenCalled();
      expect(
        sdk.syncService.userConfig.clearSyncConfigsForDBUpgrade,
      ).not.toHaveBeenCalled();
      expect(
        jobScheduler.userConfig.clearFetchDataConfigs,
      ).not.toHaveBeenCalled();
    });
  });
});
