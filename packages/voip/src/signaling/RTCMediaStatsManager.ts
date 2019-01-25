/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2019-01-25 16:54:52
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/src';
import { RTCInBoundRtp, RTCOutBoundRtp } from '../api/types';

class RTCMediaStatsManager {
  private _rtcOutBoundRtp: RTCOutBoundRtp;
  private _rtcInBoundRtp: RTCInBoundRtp;

  constructor() {}

  setInBoundRtp(rtcInBoundRtp: RTCInBoundRtp): void {
    mainLogger.info('get rtcInBoundRtp statistic Success');
    this._rtcInBoundRtp = rtcInBoundRtp;
    mainLogger.info(this._rtcInBoundRtp);
  }

  setOutBoundRtp(rtcOutBoundRtp: RTCOutBoundRtp): void {
    mainLogger.info('get rtcOutBoundRtp statistic Success');
    this._rtcOutBoundRtp = rtcOutBoundRtp;
    mainLogger.info(this._rtcOutBoundRtp);
  }
}

export { RTCMediaStatsManager };
