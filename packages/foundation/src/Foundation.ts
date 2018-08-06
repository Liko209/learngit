/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:12
 * Copyright © RingCentral. All rights reserved.
 */
// import { NetworkManager } from './network';
import config, { FoundationConfig } from './config';

class Foundation {
  static INIT(newConfig: FoundationConfig) {
    // TODO refactor: foundation should not care about rcConfig,
    // and foundation should not contain biz logic.
    Object.assign(config.rcConfig, newConfig.rcConfig);

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
    // NetworkManager.Instance.init();
  }
}
export default Foundation;
