/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 11:25:36
 * Copyright © RingCentral. All rights reserved.
 */
import { parse } from 'qs';
import ReactDOM from 'react-dom';
import React from 'react';
import { Sdk, LogControlManager, service } from 'sdk';
import { SectionUnread, UMI_SECTION_TYPE } from 'sdk/module/state';
import { AbstractModule, inject } from 'framework';
import config from '@/config';
import storeManager from '@/store';
import history from '@/history';
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
} from '@/utils/error';
import { AccountUserConfig } from 'sdk/module/account/config';
import { AccountService } from 'sdk/module/account';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import { AppEnvSetting } from 'sdk/module/env';
import { SyncGlobalConfig } from 'sdk/module/sync/config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { analyticsCollector } from '@/AnalyticsCollector';
import { Pal } from 'sdk/pal';
import { isProductionVersion } from '@/common/envUtils';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import { IApplicationInfo } from 'sdk/pal/applicationInfo';

/**
 * The root module, we call it AppModule,
 * it would be the first module being bootstrapped
 */
class AppModule extends AbstractModule {
  @inject(RouterService) private _routerService: RouterService;
  @inject(AppStore) private _appStore: AppStore;
  private _umiEventKeyMap: Map<UMI_SECTION_TYPE, GLOBAL_KEYS>;
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
    this._logControlManager.setDebugMode(!isProductionVersion);
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

    const { deployedVersion } = await fetchVersionInfo();
    Pal.instance.setApplicationInfo({
      appVersion: deployedVersion,
    } as IApplicationInfo);

    const {
      notificationCenter,
      socketManager,
      SOCKET,
      SERVICE,
      CONFIG,
    } = service;

    if (window.jupiterElectron) {
      window.jupiterElectron.onPowerMonitorEvent = (actionName: string) => {
        socketManager.onPowerMonitorEvent(actionName);
      };
    }

    // subscribe service notification to global store
    const globalStore = storeManager.getGlobalStore();

    const updateAccountInfoForGlobalStore = (isRCOnlyMode: boolean = false) => {
      const accountService = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      );

      if (accountService.isAccountReady()) {
        const accountUserConfig = new AccountUserConfig();
        const currentUserId = accountUserConfig.getGlipUserId();
        const currentCompanyId = accountUserConfig.getCurrentCompanyId();
        globalStore.set(GLOBAL_KEYS.CURRENT_USER_ID, currentUserId);
        globalStore.set(GLOBAL_KEYS.CURRENT_COMPANY_ID, currentCompanyId);
        getAppContextInfo().then(contextInfo => {
          Pal.instance.setApplicationInfo({
            env: contextInfo.env,
            appVersion: contextInfo.version,
            browser: contextInfo.browser,
            os: contextInfo.os,
            platform: contextInfo.platform,
          });
          window.jupiterElectron &&
            window.jupiterElectron.setContextInfo &&
            window.jupiterElectron.setContextInfo(contextInfo);
          errorReporter.setUserContextInfo(contextInfo);
        });
        // load phone parser module
        PhoneParserUtility.loadModule();
      }
    };

    const setStaticHttpServer = (url?: string) => {
      let staticHttpServer = url;
      if (!staticHttpServer) {
        staticHttpServer = SyncGlobalConfig.getStaticHttpServer();
      }
      globalStore.set(GLOBAL_KEYS.STATIC_HTTP_SERVER, staticHttpServer || '');
    };

    setStaticHttpServer(); // When the browser refreshes, it needs to be fetched locally

    notificationCenter.on(SERVICE.LOGIN, (isRCOnlyMode: boolean) => {
      updateAccountInfoForGlobalStore(isRCOnlyMode);
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

    // subscribe total_unread_count notification to global store
    this._umiEventKeyMap = new Map<UMI_SECTION_TYPE, GLOBAL_KEYS>();
    this._umiEventKeyMap.set(UMI_SECTION_TYPE.ALL, GLOBAL_KEYS.TOTAL_UNREAD);
    this._umiEventKeyMap.set(
      UMI_SECTION_TYPE.FAVORITE,
      GLOBAL_KEYS.FAVORITE_UNREAD,
    );
    this._umiEventKeyMap.set(
      UMI_SECTION_TYPE.DIRECT_MESSAGE,
      GLOBAL_KEYS.DIRECT_MESSAGE_UNREAD,
    );
    this._umiEventKeyMap.set(UMI_SECTION_TYPE.TEAM, GLOBAL_KEYS.TEAM_UNREAD);
    const setTotalUnread = (
      totalUnreadMap: Map<UMI_SECTION_TYPE, SectionUnread>,
    ) => {
      totalUnreadMap.forEach((sectionUnread: SectionUnread) => {
        const eventKey = this._umiEventKeyMap.get(sectionUnread.section);
        if (eventKey) {
          globalStore.set(eventKey, {
            unreadCount: sectionUnread.unreadCount,
            mentionCount: sectionUnread.mentionCount,
          });
        }
      });
    };
    notificationCenter.on(SERVICE.TOTAL_UNREAD, setTotalUnread);

    notificationCenter.on(SERVICE.SYNC_SERVICE.START_CLEAR_DATA, () => {
      // 1. show loading
      this._appStore.setGlobalLoading(true);
      // 2. clear store data
      storeManager.resetStores();
    });

    notificationCenter.on(SERVICE.SYNC_SERVICE.END_CLEAR_DATA, () => {
      // stop loading
      this._appStore.setGlobalLoading(false);
      history.replace('/messages');
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
    await Sdk.init({
      api,
      db,
    });
  }
}

export { AppModule };
