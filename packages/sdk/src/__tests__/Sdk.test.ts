/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-21 15:35:28
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="./types.d.ts" />
import { Foundation, NetworkManager } from 'foundation';
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
    reLoginGlip: jest.fn(),
    scheduleReLoginGlipJob: jest.fn(),
  };

  beforeEach(() => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init()', () => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
    it('should check login status', async () => {
      accountManager.syncLogin.mockReturnValueOnce({
        isRCOnlyMode: false,
        success: true,
      });

      await sdk.init({ api: {}, db: {} });
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGIN);
    });
    it('should re login when app in RC only mode', async () => {
      accountManager.syncLogin.mockReturnValueOnce({
        isRCOnlyMode: true,
        success: true,
      });

      await sdk.init({ api: {}, db: {} });
      expect(mockAccountService.reLoginGlip).toBeCalled();
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(notificationCenter.emitKVChange).not.toBeCalledWith(SERVICE.LOGIN);
    });
  });

  describe('onStartLogin()', () => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
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
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
    beforeEach(() => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(sdk, 'updateNetworkToken').mockImplementation(() => {});
    });
    afterEach(() => jest.restoreAllMocks());
    it('should init networkManager and sync data', () => {
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        userConfig: AccountUserConfig.prototype,
        authUserConfig: AuthUserConfig.prototype,
      });
      sdk.onAuthSuccess(false);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(syncService.syncData).toBeCalled();
      expect(notificationCenter.emitKVChange).not.toBeCalled();
    });
    it('should not sync data when in rc only mode', () => {
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        userConfig: AccountUserConfig.prototype,
        authUserConfig: AuthUserConfig.prototype,
      });
      sdk.onAuthSuccess(true);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(syncService.syncData).not.toBeCalled();
      expect(notificationCenter.emitKVChange).toBeCalled();
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
