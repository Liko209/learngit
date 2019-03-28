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
import DaoManager from './dao/DaoManager';
import { AccountManager, ServiceManager } from './framework';
import { SHOULD_UPDATE_NETWORK_TOKEN } from './service/constants';
import { SERVICE } from './service/eventKey';
import notificationCenter from './service/notificationCenter';
import { SyncService } from './module/sync';
import { ApiConfig, DBConfig, ISdkConfig } from './types';
import { AccountService } from './service';
import { DataMigration, UserConfigService } from './module/config';
import { setGlipToken } from './authenticator/utils';
import { AuthUserConfig } from './service/auth/config';
import { AccountGlobalConfig } from './service/account/config';

const AM = AccountManager;

const defaultDBConfig: DBConfig = {
  adapter: 'dexie',
};

class Sdk {
  private _glipToken: string;

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

    DataMigration.migrateKVStorage();

    await this.daoManager.initDatabase();

    // Sync service should always start before login
    this.serviceManager.startService(SyncService.name);

    const accountService: AccountService = AccountService.getInstance();
    HandleByRingCentral.platformHandleDelegate = accountService;

    notificationCenter.on(
      SHOULD_UPDATE_NETWORK_TOKEN,
      this.updateNetworkToken.bind(this),
    );

    // Listen to account events to init network and service
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
      // TODO replace all LOGIN listen on notificationCenter
      // with accountManager.on(EVENT_LOGIN)
      this.accountManager.updateSupportedServices();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
    }
  }

  async onAuthSuccess() {
    // need to set token if it's not first login
    if (AccountGlobalConfig.getUserDictionary()) {
      const authConfig = new AuthUserConfig();
      this.updateNetworkToken({
        rcToken: authConfig.getRcToken(),
        glipToken: authConfig.getGlipToken(),
      });
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
    await this.daoManager.deleteDatabase();
    UserConfigService.getInstance().clear();
    AccountGlobalConfig.removeUserDictionary();
  }

  updateNetworkToken(tokens: {
    rcToken?: Token;
    glipToken?: string;
    glip2Token?: Token;
  }) {
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
      this.networkManager.setOAuthToken(tokens.rcToken, HandleByGlip2);
    }

    if (tokens.glip2Token) {
      this.networkManager.setOAuthToken(tokens.glip2Token, HandleByGlip2);
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
