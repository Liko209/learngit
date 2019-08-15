/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-27 14:57:57
 * Copyright © RingCentral. All rights reserved.
 */

import { CommonGlobalConfig } from 'sdk/module/common/config';
import { CONFIG_KEYS } from './ConfigKeys';

class EnvConfig extends CommonGlobalConfig {
  static getEnv() {
    return CommonGlobalConfig.get(CONFIG_KEYS.ENV);
  }

  static setEnv(env: string) {
    CommonGlobalConfig.put(CONFIG_KEYS.ENV, env);
  }

  static getIsRunningE2E() {
    return CommonGlobalConfig.get(CONFIG_KEYS.RUNNING_E2E);
  }

  static disableLD(disable: boolean = true) {
    return CommonGlobalConfig.put(CONFIG_KEYS.DISABLE_LD, disable);
  }

  static getDisableSplitIo(): boolean {
    return Boolean(CommonGlobalConfig.get(CONFIG_KEYS.DISABLE_SPLIT_IO));
  }

  static disableSplitIo(disable: boolean = true) {
    return CommonGlobalConfig.put(CONFIG_KEYS.DISABLE_SPLIT_IO, disable);
  }
}

export { EnvConfig };
