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
import { HomeService } from '@/modules/home';

import './index.css';
import { generalErrorHandler, errorReporter } from '@/utils/error';
import { AccountUserConfig } from 'sdk/service/account/config';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';

/**
 * The root module, we call it AppModule,
 * it would be the first module being bootstrapped
 */
class AppModule extends AbstractModule {
  @inject(RouterService) private _routerService: RouterService;
  @inject(HomeService) private _homeService: HomeService;
  @inject(AppStore) private _appStore: AppStore;
  private _subModuleRegistered: boolean = false;
  private _umiEventKeyMap: Map<UMI_SECTION_TYPE, GLOBAL_KEYS>;

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
    LogControlManager.instance().setDebugMode(
      process.env.NODE_ENV === 'development',
    );
    const { search } = window.location;
    const { state } = parse(search, { ignoreQueryPrefix: true });
    if (state && state.length) {
      const stateSearch = state.substring(state.indexOf('?'));
      const { env } = parse(stateSearch, { ignoreQueryPrefix: true });
      if (env && env.length) {
        const configService: service.ConfigService = service.ConfigService.getInstance();
        const envChanged = await configService.switchEnv(env);
        if (envChanged) {
          config.loadEnvConfig();
        }
      }
    }

    window.addEventListener('error', (event: ErrorEvent) => {
      generalErrorHandler(event.error);
    });

    const {
      notificationCenter,
      AccountService,
      socketManager,
      ConfigService,
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

    const updateAccountInfoForGlobalStore = () => {
      const accountService: service.AccountService = AccountService.getInstance();

      if (accountService.isAccountReady()) {
        const accountUserConfig = new AccountUserConfig();
        const currentUserId = accountUserConfig.getGlipUserId();
        const currentCompanyId = accountUserConfig.getCurrentCompanyId();
        globalStore.set(GLOBAL_KEYS.CURRENT_USER_ID, currentUserId);
        globalStore.set(GLOBAL_KEYS.CURRENT_COMPANY_ID, currentCompanyId);
        errorReporter.setUser({
          id: currentUserId,
          companyId: currentCompanyId,
        });

        if (!this._subModuleRegistered) {
          // load phone parser module
          PhoneParserUtility.loadModule();

          // TODO register subModule according to account profile
          this._homeService.registerSubModules([
            'dashboard',
            'message',
            'telephony',
            'meeting',
            'contact',
            'calendar',
            'task',
            'note',
            'file',
            'setting',
          ]);

          // Avoid duplicate register
          this._subModuleRegistered = true;
        }
      }
    };

    const setStaticHttpServer = (url?: string) => {
      let staticHttpServer = url;
      if (!staticHttpServer) {
        const configService: service.ConfigService = ConfigService.getInstance();
        staticHttpServer = configService.getStaticHttpServer();
      }
      globalStore.set(GLOBAL_KEYS.STATIC_HTTP_SERVER, staticHttpServer || '');
    };

    setStaticHttpServer(); // When the browser refreshes, it needs to be fetched locally

    notificationCenter.on(SERVICE.LOGIN, () => {
      updateAccountInfoForGlobalStore();
    });

    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      updateAccountInfoForGlobalStore();
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
      const authService: service.AuthService = service.AuthService.getInstance();
      await authService.logout();
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
