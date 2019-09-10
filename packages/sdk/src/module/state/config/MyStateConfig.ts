/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-02 15:22:01
 * Copyright © RingCentral. All rights reserved.
 */

import { CommonUserConfig } from 'sdk/module/common/config';
import { CONFIG_KEYS } from './ConfigKeys';

class MyStateConfig extends CommonUserConfig {
  setMyStateId(id: number) {
    this.put(CONFIG_KEYS.MY_STATE_ID, id);
  }

  getMyStateId() {
    return this.get(CONFIG_KEYS.MY_STATE_ID);
  }
}

export { MyStateConfig };
