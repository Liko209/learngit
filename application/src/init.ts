/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 17:42:10
 */
import config from './config';
import { Sdk, LogControlManager, service } from 'sdk';
import storeManager from '@/store';

const api = config.get('api');
const db = config.get('db');
// send configs to sdk
export async function initAll() {
  LogControlManager.instance().setDebugMode(
    process.env.NODE_ENV === 'development',
  );

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
    console.log(currentUserId);
    globalStore.set('currentUserId', currentUserId);
  });
}
