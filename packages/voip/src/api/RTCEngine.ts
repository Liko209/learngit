/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCAccount } from './RTCAccount';
import { IRTCAccountListener } from './IRTCAccountListener';
import { IRTCLogger } from '../utils/IRTCLogger';
import { rtcLogger } from '../utils/RTCLoggerProxy';

class RTCEngine {
  private static instance: RTCEngine;

  constructor() {}

  public static getInstance() {
    if (!RTCEngine.instance) {
      RTCEngine.instance = new RTCEngine();
    }
    return RTCEngine.instance;
  }

  public createAccount(listener: IRTCAccountListener): RTCAccount {
    return new RTCAccount(listener);
  }

  public static setLogger(logger: IRTCLogger): void {
    rtcLogger.setLogger(logger);
  }
}

export { RTCEngine };
