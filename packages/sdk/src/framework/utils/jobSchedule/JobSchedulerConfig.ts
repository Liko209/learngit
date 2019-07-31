/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-04 21:05:59
 * Copyright © RingCentral. All rights reserved.
 */

import { UserConfig } from '../../../module/config';
import { AccountGlobalConfig } from '../../../module/account/config';
import { JOB_KEY } from './constants';

class JobSchedulerConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'job_scheduled');
  }

  setLastSuccessTime(key: JOB_KEY, time: number) {
    this.put(key, time);
  }

  getLastSuccessTime(key: JOB_KEY) {
    return this.get(key);
  }

  removeLastSuccessTime(key: JOB_KEY) {
    this.remove(key);
  }

  clearFetchDataConfigs() {
    const removeKeys: JOB_KEY[] = [
      JOB_KEY.FETCH_ACCOUNT_INFO,
      JOB_KEY.FETCH_BLOCK_NUMBER,
      JOB_KEY.FETCH_CLIENT_INFO,
      JOB_KEY.FETCH_DIALING_PLAN,
      JOB_KEY.FETCH_EXTENSION_CALLER_ID,
      JOB_KEY.FETCH_EXTENSION_INFO,
      JOB_KEY.FETCH_EXTENSION_PHONE_NUMBER_LIST,
      JOB_KEY.FETCH_FORWARDING_NUMBER,
      JOB_KEY.FETCH_PHONE_DATA,
      JOB_KEY.FETCH_RC_ACCOUNT_SERVICE_INFO,
      JOB_KEY.FETCH_ROLE_PERMISSIONS,
      JOB_KEY.FETCH_SPECIAL_NUMBER_RULE,
    ];

    removeKeys.forEach((key: JOB_KEY) => {
      this.remove(key);
    });
  }
}

export { JobSchedulerConfig };
