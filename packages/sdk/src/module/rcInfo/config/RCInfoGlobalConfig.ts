/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-08 17:03:51
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from '../../config';
import { RC_INFO_GLOBAL_KEYS, MODULE_NAME } from './constants';

class RCInfoGlobalConfig extends GlobalConfig {
  static moduleName = MODULE_NAME;

  static setStationLocation(info: any) {
    this.put(RC_INFO_GLOBAL_KEYS.STATION_LOCATION, info);
  }

  static getStationLocation() {
    return this.get(RC_INFO_GLOBAL_KEYS.STATION_LOCATION);
  }
}

export { RCInfoGlobalConfig };
