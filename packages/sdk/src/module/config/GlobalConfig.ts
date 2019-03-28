/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 16:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from './service/GlobalConfigService';

class GlobalConfig {
  static moduleName: string;

  static get(key: string) {
    return GlobalConfigService.getInstance().get(this.moduleName, key);
  }

  static put(key: string, value: any) {
    GlobalConfigService.getInstance().put(this.moduleName, key, value);
  }

  static remove(key: string) {
    GlobalConfigService.getInstance().remove(this.moduleName, key);
  }
}

export { GlobalConfig };
