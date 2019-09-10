/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 11:25:36
 * Copyright © RingCentral. All rights reserved.
 */
import { parse } from 'qs';
import ReactDOM from 'react-dom';
import React from 'react';
import { sdk } from 'sdk';

import { LogControlManager } from 'sdk/module/log';

import { notificationCenter, SOCKET, SERVICE, CONFIG } from 'sdk/service';
import { powerMonitor } from 'foundation/utils';
import { AbstractModule } from 'framework/AbstractModule';
import { inject } from 'framework/ioc';
import config from '@/config';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';
import '@/i18n';

import { AppStore } from './store';
import { App } from './container';

import { RouterService } from '@/modules/router';
import { config as appConfig } from './app.config';

import './index.css';
import {
  generalErrorHandler,
  errorReporter,
  getAppContextInfo,
  getApplicationInfo,
} from '@/utils/error';
import { AccountService } from 'sdk/module/account';
import { AppEnvSetting } from 'sdk/module/env';
import { SyncGlobalConfig } from 'sdk/module/sync/config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { analyticsCollector } from '@/AnalyticsCollector';
import { Pal } from 'sdk/pal';
import { isProductionVersion } from '@/common/envUtils';
import { showUpgradeDialog } from '@/modules/electron';
import history from '@/history';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';
import { dataCollectionHelper } from 'sdk/framework';
import { LaunchDarklyController } from '@/permissions/ld/LaunchDarklyController';
import { SplitIOController } from '@/permissions/split/SplitIOController';
import { PermissionService } from 'sdk/module/permission';
import { EnvConfig } from 'sdk/module/env/config';
import { LoginInfo } from 'sdk/types';

/**
 * The root module, we call it AppModule,
 * it would be the first module being bootstrapped
 */
class AppModule extends AbstractModule {
  @inject(RouterService) private _routerService: RouterService;
  @inject(AppStore) private _appStore: AppStore;
  private _logControlManager: LogControlManager = LogControlManager.instance();

  async bootstrap() {
    try {
      this._routerService.registerRoutes(appConfig.routes);
      await this._init();
      ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
    } catch (error) {
      generalErrorHandler(error);
      errorReporter.report(error);
    }
  }

  private async _init() {
    const isRunningE2E = EnvConfig.getIsRunningE2E();
    this._logControlManager.setDebugMode(!isProductionVersion || isRunningE2E);
    dataCollectionHelper.setIsProductionAccount(config.isProductionAccount());
    const { search } = window.location;
    const { state } = parse(search, { ignoreQueryPrefix: true });
    if (state && state.length) {
      const stateSearch = state.substring(state.indexOf('?'));
      const { env } = parse(stateSearch, { ignoreQueryPrefix: true });
      if (env && env.length) {
        const envChanged = await AppEnvSetting.switchEnv(
          env,
          ServiceLoader.getInstance<AccountService>(
            ServiceConfig.ACCOUNT_SERVICE,
          ),
        );
        if (envChanged) {
          config.loadEnvConfig();
        }
      }
    }

    window.addEventListener('error', (event: ErrorEvent) => {
      generalErrorHandler(
        event.error instanceof Error ? event.error : new Error(event.message),
      );
    });

    const applicationInfo = await getApplicationInfo();
    Pal.instance.setApplicationInfo({
      env: applicationInfo.env,
      appVersion: applicationInfo.version,
      browser: applicationInfo.browser,
      os: applicationInfo.os,
      platform: applicationInfo.platform,
    });

    if (window.jupiterElectron) {
      window.jupiterElectron.onPowerMonitorEvent = (actionName: string) => {
        powerMonitor.onPowerMonitorEvent(actionName);
      };
      window.jupiterElectron.handleNativeUpgrade = showUpgradeDialog;
    }

    // subscribe service notification to global store
    const globalStore = storeManager.getGlobalStore();

    const updateAccountInfoForGlobalStore = () => {
      const accountService = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      );

      if (accountService.isAccountReady()) {
        const accountUserConfig = accountService.userConfig;
        const currentUserId = accountUserConfig.getGlipUserId();
        const currentCompanyId = accountUserConfig.getCurrentCompanyId();
        const accountType = accountUserConfig.getAccountType();
        const isRcUser = accountType === ACCOUNT_TYPE_ENUM.RC;
        globalStore.set(GLOBAL_KEYS.CURRENT_USER_ID, currentUserId);
        globalStore.set(GLOBAL_KEYS.CURRENT_COMPANY_ID, currentCompanyId);
        globalStore.set(GLOBAL_KEYS.IS_RC_USER, isRcUser);
        getAppContextInfo().then(contextInfo => {
          window.jupiterElectron &&
            window.jupiterElectron.setContextInfo &&
            window.jupiterElectron.setContextInfo(contextInfo);
          errorReporter.setUserContextInfo(contextInfo);
        });
      }
    };

    const injectPermissionControllers = () => {
      const permissionService = ServiceLoader.getInstance<PermissionService>(
        ServiceConfig.PERMISSION_SERVICE,
      );
      permissionService.injectControllers(new LaunchDarklyController());
      permissionService.injectControllers(new SplitIOController());
    }

    const setStaticHttpServer = (url?: string) => {
      let staticHttpServer = url;
      if (!staticHttpServer) {
        staticHttpServer = SyncGlobalConfig.getStaticHttpServer();
      }
      globalStore.set(GLOBAL_KEYS.STATIC_HTTP_SERVER, staticHttpServer || '');
    };

    setStaticHttpServer(); // When the browser refreshes, it needs to be fetched locally

    notificationCenter.on(SERVICE.GLIP_LOGIN, (loginInfo: LoginInfo) => {
      loginInfo.success && updateAccountInfoForGlobalStore();
    });

    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      updateAccountInfoForGlobalStore();
      analyticsCollector.identify();
    });

    notificationCenter.on(CONFIG.STATIC_HTTP_SERVER, (url: string) => {
      setStaticHttpServer(url);
    });

    notificationCenter.on(SOCKET.NETWORK_CHANGE, (data: any) => {
      globalStore.set(GLOBAL_KEYS.NETWORK, data.state);
    });

    notificationCenter.on(SERVICE.START_LOADING, () => {
      this._appStore.setGlobalLoading(true);
    });

    notificationCenter.on(SERVICE.STOP_LOADING, () => {
      this._appStore.setGlobalLoading(false);
    });

    notificationCenter.on(SERVICE.RELOAD, () => {
      history.replace('/messages');
      window.location.reload();
    });

    notificationCenter.on(SERVICE.DO_SIGN_OUT, async () => {
      // force logout
      const accountService = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      );
      await accountService.logout();
      window.location.href = '/';
    });

    const api = config.get('api');
    const db = config.get('db');
    injectPermissionControllers();
    await sdk.init({
      api,
      db,
    });
  }
}

export { AppModule };
