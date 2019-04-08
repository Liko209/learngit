/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 16:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from './service/GlobalConfigService';
import { ServiceLoader, ServiceConfig } from '../serviceLoader';

class GlobalConfig {
  static moduleName: string;

  static get(key: string) {
    return ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    ).get(this.moduleName, key);
  }

  static put(key: string, value: any) {
    ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    ).put(this.moduleName, key, value);
  }

  static remove(key: string) {
    ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    ).remove(this.moduleName, key);
  }
}

export { GlobalConfig };
