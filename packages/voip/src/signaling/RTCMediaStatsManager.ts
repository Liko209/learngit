/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2019-01-25 16:54:52
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from '../utils/RTCLoggerProxy';
import { MediaStatsReport } from './types';
import { MediaReport } from '../report/Media';

const LOG_TAG = 'RTCMediaStatsManager';
class RTCMediaStatsManager {
  private _mediaStatsReport: MediaStatsReport = {};

  constructor() {}

  setMediaStatsReport(mediaStatsReport: any): void {
    this._formatMediaStatsReport(mediaStatsReport);
    MediaReport.instance().startAnalysis(this._mediaStatsReport);
    rtcLogger.info(
      LOG_TAG,
      ` Got mediaStats ${JSON.stringify(this._mediaStatsReport)}`,
    );
  }

  private _formatMediaStatsReport(mediaStatsReport: any) {
    if ('undefined' !== typeof mediaStatsReport.inboundRtpReport) {
      this._mediaStatsReport.inboundRtpReport =
        mediaStatsReport.inboundRtpReport;
    }

    if ('undefined' !== typeof mediaStatsReport.outboundRtpReport) {
      this._mediaStatsReport.outboundRtpReport =
        mediaStatsReport.outboundRtpReport;
    }

    if ('undefined' !== typeof mediaStatsReport.rttMS) {
      this._mediaStatsReport.rttMS = mediaStatsReport.rttMS;
    }
  }
}

export { RTCMediaStatsManager };
