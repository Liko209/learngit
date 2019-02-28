/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date:2018-03-07 19:20:43
 * Copyright © RingCentral. All rights reserved.
 */

// import featureFlag from './component/featureFlag';
import { Foundation, NetworkManager, Token } from 'foundation';
import merge from 'lodash/merge';
import './service/windowEventListener'; // to initial window events listener

import {
  Api,
  HandleByGlip,
  HandleByGlip2,
  HandleByRingCentral,
  HandleByUpload,
} from './api';
import { defaultConfig as defaultApiConfig } from './api/defaultConfig';
import { AutoAuthenticator } from './authenticator/AutoAuthenticator';
import { AuthDao } from './dao';
import {
  AUTH_GLIP2_TOKEN,
  AUTH_GLIP_TOKEN,
  AUTH_RC_TOKEN,
} from './dao/auth/constants';
import DaoManager from './dao/DaoManager';
import { AccountManager, ServiceManager } from './framework';
import { SHOULD_UPDATE_NETWORK_TOKEN } from './service/constants';
import { SERVICE } from './service/eventKey';
import notificationCenter from './service/notificationCenter';
import { SyncService } from './module/sync';
import { ApiConfig, DBConfig, ISdkConfig } from './types';
import { AccountService } from './service';

const AM = AccountManager;

const defaultDBConfig: DBConfig = {
  adapter: 'dexie',
};

class Sdk {
  constructor(
    public daoManager: DaoManager,
    public accountManager: AccountManager,
    public serviceManager: ServiceManager,
    public networkManager: NetworkManager,
    public syncService: SyncService,
  ) {}

  async init(config: ISdkConfig) {
    // Use default config value
    const apiConfig: ApiConfig = merge({}, defaultApiConfig, config.api);
    const dbConfig: DBConfig = merge({}, defaultDBConfig, config.db);
    // Initialize foundation
    Foundation.init({
      // TODO refactor foundation, extract biz logic from `foundation` to `sdk`.
      rcConfig: {
        rc: apiConfig.rc,
        glip2: apiConfig.glip2,
        server: apiConfig.rc.server,
        apiPlatform: apiConfig.rc.apiPlatform,
        apiPlatformVersion: apiConfig.rc.apiPlatformVersion,
      },
      dbAdapter: dbConfig.adapter,
    });

    Api.init(apiConfig, this.networkManager);
    await this.daoManager.initDatabase();

    // Sync service should always start before login
    this.serviceManager.startService(SyncService.name);

    const accountService: AccountService = AccountService.getInstance();
    HandleByRingCentral.tokenRefreshDelegate = accountService;

    notificationCenter.on(
      SHOULD_UPDATE_NETWORK_TOKEN,
      this.updateNetworkToken.bind(this),
    );

    // Listen to account events to init network and service
    this.accountManager.on(AM.EVENT_LOGIN, this.onLogin.bind(this));
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
      // TODO replace all LOGIN listen on notificationCenter
      // with accountManager.on(EVENT_LOGIN)
      this.accountManager.updateSupportedServices();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
    }
  }

  async onLogin() {
    this.updateNetworkToken();

    if (this.syncService.getIndexTimestamp()) {
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
        const accountService: AccountService = AccountService.getInstance();
        accountService.onBoardingPreparation();
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
    await this.daoManager.deleteDatabase();
  }

  updateNetworkToken() {
    const authDao = this.daoManager.getKVDao(AuthDao);
    const glipToken: string = authDao.get(AUTH_GLIP_TOKEN);
    const rcToken: Token = authDao.get(AUTH_RC_TOKEN);
    const glip2Token: Token = authDao.get(AUTH_GLIP2_TOKEN);

    if (glipToken) {
      this.networkManager.setOAuthToken(new Token(glipToken), HandleByGlip);
      this.networkManager.setOAuthToken(new Token(glipToken), HandleByUpload);
    }

    if (rcToken) {
      this.networkManager.setOAuthToken(rcToken, HandleByRingCentral);
      this.networkManager.setOAuthToken(rcToken, HandleByGlip2);
    }

    if (glip2Token) {
      this.networkManager.setOAuthToken(glip2Token, HandleByGlip2);
    }
  }

  updateServiceStatus(services: string[], isStart: boolean) {
    if (isStart) {
      this.serviceManager.startServices(services);
    } else {
      this.serviceManager.stopServices(services);
    }
  }
}

export default Sdk;
