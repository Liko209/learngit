/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 16:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import { Listener } from 'eventemitter2';
import { GlobalConfigService } from './service/GlobalConfigService';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class GlobalConfig {
  static moduleName: string;

  static get configService(): GlobalConfigService {
    return ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    );
  }

  static get(key: string) {
    return GlobalConfig.configService.get(this.moduleName, key);
  }

  static put(key: string, value: any) {
    GlobalConfig.configService.put(this.moduleName, key, value);
  }

  static remove(key: string) {
    GlobalConfig.configService.remove(this.moduleName, key);
  }

  static on(key: string, listener: Listener) {
    GlobalConfig.configService.on(this.moduleName, key, listener);
  }

  static off(key: string, listener: Listener) {
    GlobalConfig.configService.off(this.moduleName, key, listener);
  }
}

export { GlobalConfig };
