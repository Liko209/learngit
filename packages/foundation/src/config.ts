/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:28:10
 * Copyright © RingCentral. All rights reserved.
 */

export interface IFoundationConfig {
  rcConfig: object;
  dbAdapter: string;
  timeout?: number;
  tokenExpireInAdvance?: number;
  survivalModeUris?: {};
}

export default {
  rcConfig: {
    rc: { clientId: '', clientSecret: '' },
    glip2: { clientId: '', clientSecret: '' },
  },
  beforeExpired: 5 * 60 * 1000,
  timeout: 60 * 1000,
  dbAdapter: 'dexie',
  survivalModeUris: {},
};
