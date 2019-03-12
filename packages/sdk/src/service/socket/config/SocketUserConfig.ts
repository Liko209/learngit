/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-12 10:16:15
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../../module/config';
import { SOCKET_CONFIG_KEYS } from './configKeys';
import { AccountGlobalConfig } from '../../account/config';

class SocketUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getCurrentUserId(), 'socket');
  }

  setSocketServerHost(info: any) {
    this.put(SOCKET_CONFIG_KEYS.SOCKET_SERVER_HOST, info);
  }

  getSocketServerHost() {
    return this.get(SOCKET_CONFIG_KEYS.SOCKET_SERVER_HOST);
  }
}

export { SocketUserConfig };
