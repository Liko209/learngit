/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-04 19:49:50
 * Copyright © RingCentral. All rights reserved.
 */

enum JOB_KEY {
  FETCH_CLIENT_INFO = 'FETCH_CLIENT_INFO',
  FETCH_ACCOUNT_INFO = 'FETCH_ACCOUNT_INFO',
  FETCH_EXTENSION_INFO = 'FETCH_EXTENSION_INFO',
  FETCH_ROLE_PERMISSIONS = 'FETCH_ROLE_PERMISSIONS',
  FETCH_SPECIAL_NUMBER_RULE = 'FETCH_SPECIAL_NUMBER_RULE',
  FETCH_PHONE_DATA = 'FETCH_PHONE_DATA',
}

const DailyJobIntervalSeconds: number = 86400;

export { JOB_KEY, DailyJobIntervalSeconds };
