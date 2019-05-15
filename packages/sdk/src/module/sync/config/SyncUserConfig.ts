/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-12 10:16:15
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../config/UserConfig';
import { SYNC_CONFIG_KEYS } from './configKeys';
import { AccountGlobalConfig } from '../../../module/account/config';

class SyncUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'sync');
  }

  setIndexSocketServerHost(info: string) {
    this.put(SYNC_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST, info);
  }

  getIndexSocketServerHost() {
    return this.get(SYNC_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST);
  }

  removeIndexSocketServerHost() {
    this.remove(SYNC_CONFIG_KEYS.INDEX_SOCKET_SERVER_HOST);
  }

  setReconnectSocketServerHost(info: string) {
    this.put(SYNC_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST, info);
  }

  getReconnectSocketServerHost() {
    return this.get(SYNC_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST);
  }

  removeReconnectSocketServerHost() {
    this.remove(SYNC_CONFIG_KEYS.RECONNECT_SOCKET_SERVER_HOST);
  }

  getLastIndexTimestamp() {
    return this.get(SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  setLastIndexTimestamp(timestamp: any) {
    this.put(SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP, timestamp);
  }

  removeLastIndexTimestamp() {
    this.remove(SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  setFetchedRemaining(value: boolean) {
    this.put(SYNC_CONFIG_KEYS.FETCHED_REMAINING, value);
  }

  getFetchedRemaining() {
    return this.get(SYNC_CONFIG_KEYS.FETCHED_REMAINING);
  }

  removeFetchRemaining() {
    this.remove(SYNC_CONFIG_KEYS.FETCHED_REMAINING);
  }

  getIndexSucceed() {
    return this.get(SYNC_CONFIG_KEYS.INDEX_SUCCEED);
  }

  updateIndexSucceed(value: boolean) {
    this.put(SYNC_CONFIG_KEYS.INDEX_SUCCEED, value);
  }

  removeIndexSucceed() {
    this.remove(SYNC_CONFIG_KEYS.INDEX_SUCCEED);
  }

  setIndexStartLocalTime(time: number) {
    this.put(SYNC_CONFIG_KEYS.INDEX_START_LOCAL_TIME, time);
  }

  getIndexStartLocalTime() {
    return this.get(SYNC_CONFIG_KEYS.INDEX_START_LOCAL_TIME);
  }

  removeIndexStartLocalTime() {
    this.remove(SYNC_CONFIG_KEYS.INDEX_START_LOCAL_TIME);
  }

  setSocketConnectedLocalTime(time: number) {
    this.put(SYNC_CONFIG_KEYS.SOCKET_CONNECTED_LOCAL_TIME, time);
  }

  getSocketConnectedLocalTime() {
    return this.get(SYNC_CONFIG_KEYS.SOCKET_CONNECTED_LOCAL_TIME);
  }

  removeSocketConnectedLocalTime() {
    this.remove(SYNC_CONFIG_KEYS.SOCKET_CONNECTED_LOCAL_TIME);
  }

  clearSyncConfigsForDBUpgrade() {
    this.removeIndexSocketServerHost();
    this.removeReconnectSocketServerHost();
    this.removeLastIndexTimestamp();
    this.removeFetchRemaining();
    this.removeIndexSucceed();
    this.removeIndexStartLocalTime();
    this.removeSocketConnectedLocalTime();
  }
}

export { SyncUserConfig };
