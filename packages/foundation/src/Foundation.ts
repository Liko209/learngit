/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:12
 * Copyright © RingCentral. All rights reserved.
 */
import { config, IFoundationConfig } from './config';

class Foundation {
  static init(newConfig: IFoundationConfig) {
    if (newConfig.timeout) {
      config.timeout = newConfig.timeout;
    }
    if (newConfig.tokenExpireInAdvance) {
      config.beforeExpired = newConfig.tokenExpireInAdvance;
    }
    if (newConfig.survivalModeUris) {
      config.survivalModeUris = newConfig.survivalModeUris;
    }
    config.dbAdapter = newConfig.dbAdapter;
  }
}
export default Foundation;
