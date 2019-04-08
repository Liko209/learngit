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

  setSocketServerHost(info: any) {
    this.put(SYNC_CONFIG_KEYS.SOCKET_SERVER_HOST, info);
  }

  getSocketServerHost() {
    return this.get(SYNC_CONFIG_KEYS.SOCKET_SERVER_HOST);
  }

  getLastIndexTimestamp() {
    return this.get(SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  setLastIndexTimestamp(timestamp: any) {
    this.put(SYNC_CONFIG_KEYS.LAST_INDEX_TIMESTAMP, timestamp);
  }

  updateCanUpdateIndexTimeStamp(can: boolean) {
    this.put(SYNC_CONFIG_KEYS.CAN_UPDATE_INDEX_TIME_STAMP, can);
  }

  getCanUpdateIndexTimeStamp() {
    return this.get(SYNC_CONFIG_KEYS.CAN_UPDATE_INDEX_TIME_STAMP);
  }

  removeCanUpdateIndexTimeStamp() {
    this.remove(SYNC_CONFIG_KEYS.CAN_UPDATE_INDEX_TIME_STAMP);
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
}

export { SyncUserConfig };
