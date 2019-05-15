/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-21 15:35:28
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="./types.d.ts" />
import { Foundation, NetworkManager, mainLogger } from 'foundation';
import Sdk from '../Sdk';
import { Api, HandleByRingCentral } from '../api';
import { daoManager } from '../dao';
import { AccountManager, ServiceManager } from '../framework';
import notificationCenter from '../service/notificationCenter';
import { SERVICE } from '../service';
import { SyncService } from '../module/sync';
import {
  AccountGlobalConfig,
  AccountUserConfig,
  AuthUserConfig,
} from '../module/account/config';
import { ServiceLoader } from '../module/serviceLoader';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';

jest.mock('../module/config');
jest.mock('../module/account/config');

// Using manual mock to improve mock priority.
jest.mock('foundation', () => jest.genMockFromModule<any>('foundation'));
jest.mock('../module/sync');
jest.mock('../dao');
jest.mock('../api');
jest.mock('../utils');
jest.mock('../framework');
jest.mock('../service/notificationCenter');

describe('Sdk', () => {
  let sdk: Sdk;
  let accountManager: AccountManager;
  let serviceManager: ServiceManager;
  let networkManager: NetworkManager;
  let syncService: SyncService;
  const mockAccountService = {
    scheduleReLoginGlipJob: jest.fn(),
    userConfig: AccountUserConfig.prototype,
    authUserConfig: AuthUserConfig.prototype,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
    accountManager = new AccountManager(null);
    serviceManager = new ServiceManager(null);
    networkManager = new NetworkManager();
    syncService = new SyncService();
    sdk = new Sdk(
      daoManager,
      accountManager,
      serviceManager,
      networkManager,
      syncService,
    );
  });

  describe('init()', () => {
    it('should check login status and subscribe notifications', async () => {
      accountManager.syncLogin = jest.fn().mockReturnValueOnce({
        isRCOnlyMode: false,
        success: true,
      });
      accountManager.on = jest.fn();

      await sdk.init({ api: {}, db: {} });
      expect(notificationCenter.on).toBeCalledTimes(1);
      expect(accountManager.on).toBeCalledTimes(4);
      expect(accountManager.syncLogin).toBeCalledTimes(1);
    });
  });

  describe('onStartLogin()', () => {
    it('should init all module', async () => {
      sdk['_sdkConfig'] = { api: {}, db: {} };
      await sdk.onStartLogin();
      expect(Foundation.init).toBeCalled();
      expect(Api.init).toBeCalled();
      expect(daoManager.initDatabase).toBeCalled();
      expect(serviceManager.startService).toBeCalled();
      expect(HandleByRingCentral.platformHandleDelegate).toEqual(
        mockAccountService,
      );
    });
  });

  describe('onAuthSuccess()', () => {
    beforeEach(() => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(sdk, 'updateNetworkToken').mockImplementation(() => {});
      PhoneParserUtility.loadModule = jest.fn();
    });
    afterEach(() => jest.restoreAllMocks());
    it('should init networkManager, PhoneParserUtility ,and sync data when first login', async () => {
      syncService.syncData.mockImplementation(() => {});
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: true,
      } as any);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(PhoneParserUtility.loadModule).toBeCalled();
      expect(syncService.syncData).toBeCalled();
    });
    it('should not sync data when in rc only mode', async () => {
      syncService.syncData.mockImplementation(() => {});
      await sdk.onAuthSuccess({
        isRCOnlyMode: true,
        isFirstLogin: true,
      } as any);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(PhoneParserUtility.loadModule).toBeCalled();
      expect(syncService.syncData).not.toBeCalled();
      expect(notificationCenter.emitKVChange).toBeCalledWith(
        SERVICE.LOGIN,
        true,
      );
    });
    it('should notify login when timestamp is valid and isFirstLogin is false', async () => {
      syncService.syncData.mockImplementation(() => {});
      syncService.getIndexTimestamp.mockReturnValue(123);
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: false,
      } as any);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(PhoneParserUtility.loadModule).toBeCalled();
      expect(syncService.syncData).toBeCalled();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGIN);
    });
    it('should notify start loading when timestamp is inValid and isFirstLogin is false', async () => {
      syncService.syncData.mockImplementation(() => {});
      syncService.getIndexTimestamp.mockReturnValue(undefined);
      await sdk.onAuthSuccess({
        isRCOnlyMode: false,
        isFirstLogin: false,
      } as any);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(PhoneParserUtility.loadModule).toBeCalled();
      expect(syncService.syncData).toBeCalled();
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

    it('should clear networkManager token', () => {
      expect(networkManager.clearToken).toHaveBeenCalled();
    });
    it('should stop all service', () => {
      expect(serviceManager.stopAllServices).toHaveBeenCalled();
    });
    it('should clear database', () => {
      expect(daoManager.deleteDatabase).toHaveBeenCalled();
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
});
