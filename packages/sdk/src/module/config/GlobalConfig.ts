/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 16:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from './service/GlobalConfigService';
import { ServiceLoader, ServiceConfig } from '../serviceLoader';
import { Listener } from 'eventemitter2';

class GlobalConfig {
  static moduleName: string;

  static get configService(): GlobalConfigService {
    return ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    );
  }

  static get(key: string) {
    return this.configService.get(this.moduleName, key);
  }

  static put(key: string, value: any) {
    this.configService.put(this.moduleName, key, value);
  }

  static remove(key: string) {
    this.configService.remove(this.moduleName, key);
  }

  static on(key: string, listener: Listener) {
    this.configService.on(this.moduleName, key, listener);
  }

  static off(key: string, listener: Listener) {
    this.configService.off(this.moduleName, key, listener);
  }
}

export { GlobalConfig };
