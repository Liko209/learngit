/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-02 15:42:37
 * Copyright © RingCentral. All rights reserved.
 */

import { CommonGlobalConfig } from '../../common/config';

const RC_INFO_COMMON_CONFIG_KEYS = {
  PHONE_DATA: 'PHONE_DATA',
};

class RcInfoCommonGlobalConfig extends CommonGlobalConfig {
  static setPhoneData(info: any) {
    this.put(RC_INFO_COMMON_CONFIG_KEYS.PHONE_DATA, info);
  }

  static getPhoneData() {
    return this.get(RC_INFO_COMMON_CONFIG_KEYS.PHONE_DATA);
  }
}

export { RcInfoCommonGlobalConfig, RC_INFO_COMMON_CONFIG_KEYS };
