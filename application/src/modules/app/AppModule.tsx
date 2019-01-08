/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-07 11:25:36
 * Copyright © RingCentral. All rights reserved.
 */
import { Sdk, LogControlManager, service } from 'sdk';
import { parse } from 'qs';
import ReactDOM from 'react-dom';
import React from 'react';
import { AbstractModule, inject } from 'framework';
import config from '@/config';
import storeManager from '@/store';
import history from '@/history';
import { GLOBAL_KEYS } from '@/store/constants';
import '@/i18n';

import { App } from './container';

import { RouterService } from '@/modules/router';
import { config as appConfig } from './app.config';

import './index.css';

/**
 * The root module, we call it AppModule,
 * it would be the first module being bootstrapped
 */
class AppModule extends AbstractModule {
  @inject(RouterService)
  private _routerService: RouterService;

  async bootstrap() {
    this._routerService.registerRoutes(appConfig.routes);
    await this._init();
    ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
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

    const {
      notificationCenter,
      AccountService,
      socketManager,
      ConfigService,
      SOCKET,
      SERVICE,
      CONFIG,
    } = service;

    window.jupiterElectron = {
      ...window.jupiterElectron,
      onPowerMonitorEvent: (actionName: string) => {
        socketManager.onPowerMonitorEvent(actionName);
      },
    };

    // subscribe service notification to global store
    const globalStore = storeManager.getGlobalStore();

    const updateAccountInfoForGlobalStore = () => {
      const accountService: service.AccountService = AccountService.getInstance();

      if (accountService.isAccountReady()) {
        const currentUserId = accountService.getCurrentUserId();
        const currentCompanyId = accountService.getCurrentCompanyId();
        globalStore.set(GLOBAL_KEYS.CURRENT_USER_ID, currentUserId);
        globalStore.set(GLOBAL_KEYS.CURRENT_COMPANY_ID, currentCompanyId);
      }
    };

    notificationCenter.on(SERVICE.LOGIN, () => {
      updateAccountInfoForGlobalStore();
    });

    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      updateAccountInfoForGlobalStore();
    });

    notificationCenter.on(CONFIG.STATIC_HTTP_SERVER, () => {
      const configService: service.ConfigService = ConfigService.getInstance();
      const staticHttpServer = configService.getStaticHttpServer();
      globalStore.set(GLOBAL_KEYS.STATIC_HTTP_SERVER, staticHttpServer);
    });

    notificationCenter.on(SOCKET.NETWORK_CHANGE, (data: any) => {
      globalStore.set(GLOBAL_KEYS.NETWORK, data.state);
    });

    notificationCenter.on(SERVICE.SYNC_SERVICE.START_CLEAR_DATA, () => {
      // 1. show loading
      globalStore.set(GLOBAL_KEYS.APP_SHOW_GLOBAL_LOADING, true);
      // 2. clear store data
      storeManager.resetStores();
    });

    notificationCenter.on(SERVICE.SYNC_SERVICE.END_CLEAR_DATA, () => {
      // stop loading
      globalStore.set(GLOBAL_KEYS.APP_SHOW_GLOBAL_LOADING, false);
      history.replace('/messages');
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
