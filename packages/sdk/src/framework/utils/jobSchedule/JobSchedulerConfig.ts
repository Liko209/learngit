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
    this.remove(JOB_KEY.FETCH_ACCOUNT_INFO);
    this.remove(JOB_KEY.FETCH_CLIENT_INFO);
    this.remove(JOB_KEY.FETCH_EXTENSION_INFO);
    this.remove(JOB_KEY.FETCH_PHONE_DATA);
    this.remove(JOB_KEY.FETCH_ROLE_PERMISSIONS);
    this.remove(JOB_KEY.FETCH_SPECIAL_NUMBER_RULE);
  }
}

export { JobSchedulerConfig };
