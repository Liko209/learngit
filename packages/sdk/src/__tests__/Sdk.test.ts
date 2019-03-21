/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-21 15:35:28
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="./types.d.ts" />
import { Foundation, NetworkManager, Token } from 'foundation';
import Sdk from '../Sdk';
import {
  Api,
  HandleByGlip,
  HandleByRingCentral,
  HandleByUpload,
  HandleByGlip2,
} from '../api';
import { daoManager } from '../dao';
import { AccountManager, ServiceManager } from '../framework';
import { GlobalConfigService, UserConfigService } from '../module/config';
import { AuthGlobalConfig } from '../service/auth/config';
import { SyncService } from '../module/sync';

jest.mock('../module/config');
jest.mock('../service/auth/config');
GlobalConfigService.getInstance = jest.fn();

// Using manual mock to improve mock priority.
jest.mock('foundation', () => jest.genMockFromModule<any>('foundation'));
jest.mock('../module/sync');
jest.mock('../dao');
jest.mock('../api');
jest.mock('../utils');
jest.mock('../framework');

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
    beforeEach(async () => {
      await sdk.init({ api: {}, db: {} });
    });
    it('should init Foundation', () => {
      expect(Foundation.init).toHaveBeenCalled();
    });

    it('should init Api', () => {
      expect(Api.init).toHaveBeenCalled();
    });

    it('should init Dao', () => {
      expect(daoManager.initDatabase).toHaveBeenCalled();
    });
  });

  describe('onAuthSuccess()', () => {
    beforeEach(() => {
      jest.spyOn(sdk, 'updateNetworkToken').mockImplementation(() => {});
      sdk.onAuthSuccess();
    });
    afterEach(() => jest.restoreAllMocks());

    it('should init networkManager', () => {
      expect(sdk.updateNetworkToken).toHaveBeenCalled();
    });
    it('should sync data', () => {
      expect(syncService.syncData).toHaveBeenCalled();
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

  describe('initNetworkManager()', () => {
    it('should init with glip token', () => {
      AuthGlobalConfig.getGlipToken = jest
        .fn()
        .mockReturnValueOnce('glip token');
      AuthGlobalConfig.getRcToken = jest.fn().mockReturnValueOnce(null);
      AuthGlobalConfig.getGlip2Token = jest.fn().mockReturnValueOnce(null);

      sdk.updateNetworkToken();

      expect(networkManager.setOAuthToken).toHaveBeenCalledWith(
        new Token('glip token'),
        HandleByGlip,
      );
      expect(networkManager.setOAuthToken).toHaveBeenCalledWith(
        new Token('glip token'),
        HandleByUpload,
      );
    });

    it('should init with rc token ', () => {
      AuthGlobalConfig.getGlipToken = jest.fn().mockReturnValueOnce(null);
      AuthGlobalConfig.getRcToken = jest.fn().mockReturnValueOnce('rc token');
      AuthGlobalConfig.getGlip2Token = jest.fn().mockReturnValueOnce(null);

      sdk.updateNetworkToken();

      expect(networkManager.setOAuthToken).toHaveBeenCalledWith(
        'rc token',
        HandleByRingCentral,
      );
      expect(networkManager.setOAuthToken).toHaveBeenCalledWith(
        'rc token',
        HandleByGlip2,
      );
    });

    it('should init with glip2 token ', () => {
      AuthGlobalConfig.getGlipToken = jest.fn().mockReturnValueOnce(null);
      AuthGlobalConfig.getRcToken = jest.fn().mockReturnValueOnce(null);
      AuthGlobalConfig.getGlip2Token = jest
        .fn()
        .mockReturnValueOnce('glip2 token');
      sdk.updateNetworkToken();

      expect(networkManager.setOAuthToken).toHaveBeenCalledWith(
        'glip2 token',
        HandleByGlip2,
      );
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
