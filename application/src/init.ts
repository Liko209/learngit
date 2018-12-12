/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 17:42:10
 * Copyright © RingCentral. All rights reserved.
 */
import config from './config';
import { Sdk, LogControlManager, service } from 'sdk';
import storeManager from '@/store';
import history from '@/history';
import { GLOBAL_KEYS } from '@/store/constants';
import { parse } from 'qs';

// send configs to sdk
export async function initAll() {
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
