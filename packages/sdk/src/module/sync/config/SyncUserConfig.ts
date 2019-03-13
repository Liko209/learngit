/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-12 10:16:15
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../config/UserConfig';
import { SYNC_CONFIG_KEYS } from './configKeys';
import { AccountGlobalConfig } from '../../../service/account/config';

class SyncUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getCurrentUserId(), 'sync');
  }

  setSocketServerHost(info: any) {
    this.put(SYNC_CONFIG_KEYS.SOCKET_SERVER_HOST, info);
  }

  getSocketServerHost() {
    return this.get(SYNC_CONFIG_KEYS.SOCKET_SERVER_HOST);
  }
}

export { SyncUserConfig };
