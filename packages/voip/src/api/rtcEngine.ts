/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCAccount, IRTCAccountListener } from './rtcAccount';
import { ILogger } from '../util/ILogger';
import { rtcLogger } from '../util/LoggerProxy';

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

  public static setLogger(logger: ILogger): void {
    rtcLogger.setLogger(logger);
  }
}

export { RTCEngine };
