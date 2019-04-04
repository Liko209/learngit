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
import {
  GlobalConfigService,
  UserConfigService,
  DataMigration,
} from '../module/config';
import notificationCenter from '../service/notificationCenter';
import { SERVICE } from '../service';
import { AccountService } from '../module/account';
import { SyncService } from '../module/sync';
import { AccountGlobalConfig } from '../module/account/config';

jest.mock('../module/config');
jest.mock('../module/account/config');
GlobalConfigService.getInstance = jest.fn();

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
    it('should init all module', async () => {
      accountManager.syncLogin.mockReturnValueOnce({
        isRCOnlyMode: false,
        success: true,
      });
      AccountService.getInstance = jest.fn().mockReturnValue('accountService');

      await sdk.init({ api: {}, db: {} });
      expect(Foundation.init).toBeCalled();
      expect(Api.init).toBeCalled();
      expect(DataMigration.migrateKVStorage).toBeCalled();
      expect(daoManager.initDatabase).toBeCalled();
      expect(serviceManager.startService).toBeCalled();
      expect(HandleByRingCentral.platformHandleDelegate).toEqual(
        'accountService',
      );
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGIN);
    });
    it('should re login when app in RC only mode', async () => {
      accountManager.syncLogin.mockReturnValueOnce({
        isRCOnlyMode: true,
        success: true,
      });
      const mockReLogin = jest.fn();

      const mockAccountService = {
        reLoginGlip: mockReLogin,
      };

      AccountService.getInstance = jest
        .fn()
        .mockReturnValue(mockAccountService);

      await sdk.init({ api: {}, db: {} });
      expect(Foundation.init).toBeCalled();
      expect(Api.init).toBeCalled();
      expect(DataMigration.migrateKVStorage).toBeCalled();
      expect(daoManager.initDatabase).toBeCalled();
      expect(serviceManager.startService).toBeCalled();
      expect(HandleByRingCentral.platformHandleDelegate).toEqual(
        mockAccountService,
      );
      expect(mockReLogin).toBeCalled();
      expect(accountManager.updateSupportedServices).toBeCalled();
      expect(notificationCenter.emitKVChange).not.toBeCalledWith(SERVICE.LOGIN);
    });
  });

  describe('onAuthSuccess()', () => {
    beforeEach(() => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(sdk, 'updateNetworkToken').mockImplementation(() => {});
    });
    afterEach(() => jest.restoreAllMocks());
    it('should init networkManager and sync data', () => {
      sdk.onAuthSuccess(false);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(syncService.syncData).toBeCalled();
      expect(notificationCenter.emitKVChange).not.toBeCalled();
    });
    it('should not sync data when in rc only mode', () => {
      sdk.onAuthSuccess(true);
      expect(sdk.updateNetworkToken).toBeCalled();
      expect(syncService.syncData).not.toBeCalled();
      expect(notificationCenter.emitKVChange).toBeCalled();
    });
  });

  describe('onLogout()', () => {
    beforeEach(async () => {
      UserConfigService.getInstance = jest
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
