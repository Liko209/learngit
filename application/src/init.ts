/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 17:42:10
 * Copyright © RingCentral. All rights reserved.
 */
import config from './config';
import { Sdk, LogControlManager, service } from 'sdk';
import storeManager from '@/store';
import history from '@/utils/history';
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

  const api = config.get('api');
  const db = config.get('db');

  await Sdk.init({
    api,
    db,
  });

  // subscribe service notification to global store
  const { notificationCenter, AccountService, SOCKET, SERVICE } = service;
  const globalStore = storeManager.getGlobalStore();
  const accountService: service.AccountService = AccountService.getInstance();
  notificationCenter.on(SOCKET.NETWORK_CHANGE, (data: any) => {
    globalStore.set('network', data.state);
  });
  notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
    const currentUserId = accountService.getCurrentUserId();
    globalStore.set('currentUserId', currentUserId);
  });
  notificationCenter.on(SERVICE.GATE_WAY_504_BEGIN, () => {
    // 1. show loading
    globalStore.set('showGlobalLoading', true);
    // 2. clear store data
    storeManager.resetStores();
  });
  notificationCenter.on(SERVICE.GATE_WAY_504_END, () => {
    // stop loading
    globalStore.set('showGlobalLoading', false);
    history.replace('/messages');
  });
}
