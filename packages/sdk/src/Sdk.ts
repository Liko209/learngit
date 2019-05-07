/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date:2018-03-07 19:20:43
 * Copyright © RingCentral. All rights reserved.
 */

// import featureFlag from './component/featureFlag';
import {
  Foundation,
  NetworkManager,
  Token,
  dataAnalysis,
  sleepModeDetector,
} from 'foundation';
import merge from 'lodash/merge';
import './service/windowEventListener'; // to initial window events listener

import { Api, HandleByGlip, HandleByRingCentral, HandleByUpload } from './api';
import { defaultConfig as defaultApiConfig } from './api/defaultConfig';
import { AutoAuthenticator } from './authenticator/AutoAuthenticator';
import DaoManager from './dao/DaoManager';
import { AccountManager, ServiceManager } from './framework';
import { SHOULD_UPDATE_NETWORK_TOKEN } from './service/constants';
import { SERVICE } from './service/eventKey';
import notificationCenter from './service/notificationCenter';
import { SyncService } from './module/sync';
import { ApiConfig, DBConfig, ISdkConfig } from './types';
import { AccountService } from './module/account';
import { DataMigration, UserConfigService } from './module/config';
import { setGlipToken } from './authenticator/utils';
import { AuthUserConfig, AccountGlobalConfig } from './module/account/config';
import { ServiceConfig, ServiceLoader } from './module/serviceLoader';

const AM = AccountManager;

const defaultDBConfig: DBConfig = {
  adapter: 'dexie',
};

class Sdk {
  private _glipToken: string;
  private _sdkConfig: ISdkConfig;
  private _sleepModeKey: string = 'SDK_SLEEP_MODE_DETECT';

  constructor(
    public daoManager: DaoManager,
    public accountManager: AccountManager,
    public serviceManager: ServiceManager,
    public networkManager: NetworkManager,
    public syncService: SyncService,
  ) {}

  async init(config: ISdkConfig) {
    this._sdkConfig = config;
    DataMigration.migrateKVStorage();

    notificationCenter.on(
      SHOULD_UPDATE_NETWORK_TOKEN,
      this.updateNetworkToken.bind(this),
    );
    // Listen to account events to init network and service
    this.accountManager.on(AM.START_LOGIN, this.onStartLogin.bind(this));
    this.accountManager.on(AM.AUTH_SUCCESS, this.onAuthSuccess.bind(this));
    this.accountManager.on(AM.EVENT_LOGOUT, this.onLogout.bind(this));
    this.accountManager.on(
      AM.EVENT_SUPPORTED_SERVICE_CHANGE,
      this.updateServiceStatus.bind(this),
    );

    // Check is already login
    const loginResp = await this.accountManager.syncLogin(
      AutoAuthenticator.name,
    );

    if (loginResp && loginResp.success) {
      if (loginResp.isRCOnlyMode) {
        this.accountManager.updateSupportedServices();
        const accountService = ServiceLoader.getInstance<AccountService>(
          ServiceConfig.ACCOUNT_SERVICE,
        );
        accountService.reLoginGlip();
      } else {
        // TODO replace all LOGIN listen on notificationCenter
        // with accountManager.on(EVENT_LOGIN)
        this.accountManager.updateSupportedServices();
        notificationCenter.emitKVChange(SERVICE.LOGIN);
      }
    } else {
      indexedDB.deleteDatabase('Glip');
    }
    this._subscribeNotification();
    this._initDataAnalysis();
  }

  async onStartLogin() {
    // Use default config value
    const apiConfig: ApiConfig = merge(
      {},
      defaultApiConfig,
      this._sdkConfig.api,
    );
    const dbConfig: DBConfig = merge({}, defaultDBConfig, this._sdkConfig.db);

    Foundation.init({
      dbAdapter: dbConfig.adapter,
    });
    Api.init(apiConfig, this.networkManager);
    await this.daoManager.initDatabase();

    // Sync service should always start before login
    this.serviceManager.startService(SyncService.name);

    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    HandleByRingCentral.platformHandleDelegate = accountService;
  }

  async onAuthSuccess(isRCOnlyMode: boolean) {
    // need to set token if it's not first login
    if (AccountGlobalConfig.getUserDictionary()) {
      const authConfig = new AuthUserConfig();
      this.updateNetworkToken({
        rcToken: authConfig.getRCToken(),
        glipToken: authConfig.getGlipToken(),
      });
    }

    if (isRCOnlyMode) {
      this.accountManager.updateSupportedServices();
      notificationCenter.emitKVChange(SERVICE.LOGIN, isRCOnlyMode);
      const accountService = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      );
      accountService.scheduleReLoginGlipJob();
      return;
    }

    await this.syncService.syncData({
      /**
       * LifeCycle when first login
       */
      onInitialLoaded: async () => {
        // await featureFlag.getServicePermission();
        this.accountManager.updateSupportedServices();
      },
      onInitialHandled: async () => {
        const accountService = ServiceLoader.getInstance<AccountService>(
          ServiceConfig.ACCOUNT_SERVICE,
        );
        accountService.onBoardingPreparation();
        if (this._glipToken) {
          await setGlipToken(this._glipToken);
        }
      },
      /**
       * LifeCycle when refresh page
       */
      onIndexLoaded: async () => {
        this.accountManager.updateSupportedServices();
      },
    });
  }

  async onLogout() {
    this.networkManager.clearToken();
    this.serviceManager.stopAllServices();
    this.daoManager.deleteDatabase();
    ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    ).clear();
    AccountGlobalConfig.removeUserDictionary();
    this._resetDataAnalysis();
  }

  updateNetworkToken(tokens: { rcToken?: Token; glipToken?: string }) {
    if (tokens.glipToken) {
      this._glipToken = tokens.glipToken;
      this.networkManager.setOAuthToken(
        new Token(tokens.glipToken),
        HandleByGlip,
      );
      this.networkManager.setOAuthToken(
        new Token(tokens.glipToken),
        HandleByUpload,
      );
    }
    if (tokens.rcToken) {
      this.networkManager.setOAuthToken(tokens.rcToken, HandleByRingCentral);
    }
  }

  updateServiceStatus(services: string[], isStart: boolean) {
    if (isStart) {
      this.serviceManager.startServices(services);
    } else {
      this.serviceManager.stopServices(services);
    }
  }

  private _subscribeNotification() {
    sleepModeDetector.subScribe(this._sleepModeKey, (interval: number) => {
      notificationCenter.emit(SERVICE.WAKE_UP_FROM_SLEEP, interval);
    });
  }

  private _initDataAnalysis() {
    dataAnalysis.init();
  }
  private _resetDataAnalysis() {
    dataAnalysis.reset();
  }
}

export default Sdk;
