/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-23 10:46:15
 * Copyright © RingCentral. All rights reserved.
 */

import { DBConfig } from 'sdk/module/config';
import { daoManager } from 'sdk/dao';
import { RcSubscriptionInfo } from 'sdk/api/ringcentral/types';
import { UndefinedAble } from 'sdk/types';
import { MODULE_NAME, RC_SUBSCRIPTION_KEYS } from './constants';

class RCEventSubscriptionConfig extends DBConfig {
  constructor() {
    super(MODULE_NAME, daoManager.getDBKVDao());
  }

  async setRcEventSubscription(value: RcSubscriptionInfo) {
    await this.put(RC_SUBSCRIPTION_KEYS.SUBSCRIPTION_INFO, value);
  }

  async getRcEventSubscription(): Promise<UndefinedAble<RcSubscriptionInfo>> {
    return this.get(RC_SUBSCRIPTION_KEYS.SUBSCRIPTION_INFO);
  }

  async deleteRcEventSubscription() {
    return this.remove(RC_SUBSCRIPTION_KEYS.SUBSCRIPTION_INFO);
  }
}

export { RCEventSubscriptionConfig };
