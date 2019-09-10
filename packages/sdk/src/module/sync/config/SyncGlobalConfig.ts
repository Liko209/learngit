/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-28 15:27:28
 * Copyright © RingCentral. All rights reserved.
 */

import { CommonGlobalConfig } from 'sdk/module/common/config';
import { CONFIG_KEYS } from './configKeys';

class SyncGlobalConfig extends CommonGlobalConfig {
  static getStaticHttpServer() {
    return this.get(CONFIG_KEYS.STATIC_HTTP_SERVER);
  }

  static setStaticHttpServer(server: string) {
    this.put(CONFIG_KEYS.STATIC_HTTP_SERVER, server);
  }
}

export { SyncGlobalConfig };
