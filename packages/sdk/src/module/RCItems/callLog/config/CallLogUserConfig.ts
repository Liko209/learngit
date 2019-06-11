/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-05 00:09:01
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemUserConfig } from '../../config/RCItemUserConfig';
import { CALL_LOG_CONFIG_KEYS } from '../constants';
import { PseudoCallLogInfo } from '../types';

class CallLogUserConfig extends RCItemUserConfig {
  async setPseudoCallLogInfo(data: PseudoCallLogInfo) {
    await this.put(CALL_LOG_CONFIG_KEYS.PSEUDO_CALL_LOG_INFO, data);
  }

  async getPseudoCallLogInfo(): Promise<PseudoCallLogInfo> {
    return await this.get(CALL_LOG_CONFIG_KEYS.PSEUDO_CALL_LOG_INFO);
  }
}

export { CallLogUserConfig };
