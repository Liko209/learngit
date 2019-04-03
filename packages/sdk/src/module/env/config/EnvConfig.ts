/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-27 14:57:57
 * Copyright © RingCentral. All rights reserved.
 */

import { CommonGlobalConfig } from '../../config';
import { CONFIG_KEYS } from './ConfigKeys';

class EnvConfig extends CommonGlobalConfig {
  static getEnv() {
    return this.get(CONFIG_KEYS.ENV);
  }

  static setEnv(env: string) {
    this.put(CONFIG_KEYS.ENV, env);
  }
}

export { EnvConfig };
