/*
 * @Author: Paynter Chen
 * @Date: 2019-08-20 15:35:02
 * Copyright © RingCentral. All rights reserved.
 */
import { CommonGlobalConfig } from 'sdk/module/common/config';
import { CONFIG_KEYS } from './configKeys';

class LogGlobalConfig extends CommonGlobalConfig {
  static getClientId() {
    return this.get(CONFIG_KEYS.CLIENT_ID);
  }

  static setClientId(id: string) {
    this.put(CONFIG_KEYS.CLIENT_ID, id);
  }
}

export { LogGlobalConfig };
