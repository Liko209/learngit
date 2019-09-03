/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date:2018-03-07 19:20:43
 * Copyright © RingCentral. All rights reserved.
 */

// import featureFlag from './component/featureFlag';
import Foundation from 'foundation/Foundation';
import { NetworkManager, Token } from 'foundation/network';
import { dataAnalysis } from 'foundation/analysis';
import { sleepModeDetector } from 'foundation/utils';
import { mainLogger } from 'foundation/log';
import { Performance } from 'foundation/performance';
import merge from 'lodash/merge';
import './service/windowEventListener'; // to initial window events listener

import { Api, HandleByGlip, HandleByRingCentral, HandleByUpload } from './api';
import { defaultConfig as defaultApiConfig } from './api/defaultConfig';
import { AutoAuthenticator } from './authenticator/AutoAuthenticator';
import DaoManager from './dao/DaoManager';
import { AccountManager, ServiceManager, IAuthResponse } from './framework';
import { SHOULD_UPDATE_NETWORK_TOKEN } from './service/constants';
import { SERVICE } from './service/eventKey';
import notificationCenter from './service/notificationCenter';
import { SyncService } from './module/sync';
import { ApiConfig, DBConfig, ISdkConfig, LoginInfo } from './types';
import { AccountService } from './module/account';
import { setGlipToken } from './authenticator/utils';
import { AccountGlobalConfig } from './module/account/config';
import { ServiceConfig, ServiceLoader } from './module/serviceLoader';
import { PhoneParserUtility } from './utils/phoneParser';
import { configMigrator } from './framework/config';
import { ACCOUNT_TYPE_ENUM } from './authenticator/constants';
import { jobScheduler } from './framework/utils/jobSchedule';
import { UserConfigService } from './module/config';
import { CrashManager } from './module/crash';
import { EnvConfig } from './module/env/config';

const LOG_TAG = 'SDK';
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
  ) {
    CrashManager.getInstance().monitor();
  }

  async init(config: ISdkConfig) {
    this._sdkConfig = config;
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
    configMigrator.observeUserDictionaryStatus();

    this._initDataAnalysis();

    // Check is already login
    const loginResp = await this.accountManager.syncLogin(
      AutoAuthenticator.name,
    );

    if (!loginResp || !loginResp.success) {
      if (process.env.NODE_ENV !== 'test') {
        mainLogger.tags(LOG_TAG).info('init() delete database');
        window.indexedDB && window.indexedDB.deleteDatabase('Glip');
      }
    }
    this._subscribeNotification();
    mainLogger.tags(LOG_TAG).info('sdk init finished');
  }

  async onStartLogin() {
    mainLogger.tags(LOG_TAG).info('onStartLogin');
    await this.daoManager.initDatabase(this.clearAllData);

    // Sync service should always start before login
    this.serviceManager.startService(SyncService.name);

    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    HandleByRingCentral.platformHandleDelegate = accountService;
    HandleByGlip.platformHandleDelegate = accountService;
  }

  async onAuthSuccess(authResponse: IAuthResponse) {
    mainLogger.tags(LOG_TAG).info('start onAuthSuccess');
    // need to set token if it's not first login
    if (AccountGlobalConfig.getUserDictionary()) {
      const authConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).authUserConfig;
      this.updateNetworkToken({
        rcToken: authConfig.getRCToken(),
        glipToken: authConfig.getGlipToken(),
      });
    }

    // load phone parser module
    PhoneParserUtility.loadModule();

    this.accountManager.updateSupportedServices();

    const rcLoginInfo: LoginInfo = { success: true, isFirstLogin: authResponse.isFirstLogin };
    if (authResponse.isRCOnlyMode) {
      notificationCenter.emitKVChange(SERVICE.RC_LOGIN, rcLoginInfo);
      const accountService = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      );
      accountService.startLoginGlip();
      return;
    }

    let isInLoading = false;
    if (!authResponse.isFirstLogin) {
      const accountType = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig.getAccountType();
      if (accountType === ACCOUNT_TYPE_ENUM.RC) {
        notificationCenter.emitKVChange(SERVICE.RC_LOGIN, rcLoginInfo);
      }

      const lastIndexTimestamp = this.syncService.getIndexTimestamp();
      if (lastIndexTimestamp) {
        const glipLoginInfo: LoginInfo = { success: true, isFirstLogin: authResponse.isFirstLogin };
        notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, glipLoginInfo);
      } else {
        mainLogger.tags(LOG_TAG).info('start loading');
        isInLoading = true;
        notificationCenter.emitKVChange(SERVICE.START_LOADING);
      }
    }

    try {
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
    } finally {
      if (isInLoading) {
        mainLogger.tags(LOG_TAG).info('stop loading');
        notificationCenter.emitKVChange(SERVICE.STOP_LOADING);
      }

      if (AccountGlobalConfig.getUserDictionary()) {
        Performance.instance.putAttribute(
          'userId',
          AccountGlobalConfig.getUserDictionary(),
        );
      }
    }
    mainLogger.tags(LOG_TAG).info('end onAuthSuccess');
  }

  async onLogout() {
    this.networkManager.clearToken();
    this.serviceManager.stopAllServices();
    mainLogger.tags(LOG_TAG).info('onLogout() delete database');
    this.daoManager.deleteDatabase();
    ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    ).clear();
    AccountGlobalConfig.removeUserDictionary();
    this._resetDataAnalysis();
    CrashManager.getInstance().dispose();
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
    const isRunningE2E = EnvConfig.getIsRunningE2E();
    !isRunningE2E && dataAnalysis.init(Api.httpConfig.segment);
  }


  private _resetDataAnalysis() {
    dataAnalysis.reset();
  }

  clearAllData = async () => {
    mainLogger.tags(LOG_TAG).info('clearAllData() delete database');
    await this.daoManager.deleteDatabase();
    // remove relevant config
    if (AccountGlobalConfig.getUserDictionary()) {
      // TODO FIJI-4396
      this.syncService.userConfig.clearSyncConfigsForDBUpgrade();
      jobScheduler.userConfig.clearFetchDataConfigs();
    }
  };
}

export default Sdk;
