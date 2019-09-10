/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-27 14:57:57
 * Copyright © RingCentral. All rights reserved.
 */

import { CommonGlobalConfig } from 'sdk/module/common/config';
import { CONFIG_KEYS } from './ConfigKeys';

class EnvConfig extends CommonGlobalConfig {
  static getEnv() {
    return EnvConfig.get(CONFIG_KEYS.ENV);
  }

  static setEnv(env: string) {
    EnvConfig.put(CONFIG_KEYS.ENV, env);
  }

  static getIsRunningE2E() {
    return EnvConfig.get(CONFIG_KEYS.RUNNING_E2E);
  }

  static disableLD(disable: boolean = true) {
    return EnvConfig.put(CONFIG_KEYS.DISABLE_LD, disable);
  }

  static getDisableSplitIo(): boolean {
    return Boolean(this.get(CONFIG_KEYS.DISABLE_SPLIT_IO));
  }

  static disableSplitIo(disable: boolean = true) {
    return EnvConfig.put(CONFIG_KEYS.DISABLE_SPLIT_IO, disable);
  }
}

export { EnvConfig };
