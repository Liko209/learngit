/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2019-01-25 16:54:52
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCInBoundRtp, RTCOutBoundRtp } from '../api/types';

const loggerTag = 'RTCMediaStatsManager';
class RTCMediaStatsManager {
  private static instance: RTCMediaStatsManager;
  private _rtcOutBoundRtp: RTCOutBoundRtp;
  private _rtcInBoundRtp: RTCInBoundRtp;

  constructor() {}

  public static getInstance() {
    if (!RTCMediaStatsManager.instance) {
      RTCMediaStatsManager.instance = new RTCMediaStatsManager();
    }
    return RTCMediaStatsManager.instance;
  }

  setInBoundRtp(rtcInBoundRtp: RTCInBoundRtp): void {
    rtcLogger.info(loggerTag, 'get rtcInBoundRtp statistic Success');
    this._rtcInBoundRtp = rtcInBoundRtp;
    console.info(this._rtcInBoundRtp);
  }

  setOutBoundRtp(rtcOutBoundRtp: RTCOutBoundRtp): void {
    rtcLogger.info(loggerTag, 'get rtcOutBoundRtp statistic Success');
    this._rtcOutBoundRtp = rtcOutBoundRtp;
    console.info(loggerTag, this._rtcOutBoundRtp);
  }
}

export { RTCMediaStatsManager };
