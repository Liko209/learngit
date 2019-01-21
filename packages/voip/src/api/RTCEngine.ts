/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCAccount } from './RTCAccount';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCLogger } from '../utils/IRTCLogger';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { rtcRestApiManager } from '../utils/RTCRestApiManager';
import { ITelephonyNetworkDelegate, ITelephonyDaoDelegate } from 'foundation';

class RTCEngine {
  private static instance: RTCEngine;

  constructor() {}

  public static getInstance() {
    if (!RTCEngine.instance) {
      RTCEngine.instance = new RTCEngine();
    }
    return RTCEngine.instance;
  }

  public createAccount(delegate: IRTCAccountDelegate): RTCAccount {
    return new RTCAccount(delegate);
  }

  public static setLogger(logger: IRTCLogger): void {
    rtcLogger.setLogger(logger);
  }

  public setNetworkDelegate(delegate: ITelephonyNetworkDelegate): void {
    rtcRestApiManager.setNetworkDelegate(delegate);
  }

  public setTelephonyDaoDelegate(delegate: ITelephonyDaoDelegate): void {}
}

export { RTCEngine };
