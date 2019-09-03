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
  private _hasSentPackages: boolean = false;
  private _hasReceivedPackages: boolean = false;
  private _mediaStatsReport: MediaStatsReport = {};

  hasSentPackages(): boolean {
    return this._hasSentPackages;
  }

  hasReceivedPackages(): boolean {
    return this._hasReceivedPackages;
  }

  setMediaStatsReport(mediaStatsReport: any): void {
    this._formatMediaStatsReport(mediaStatsReport);
    MediaReport.instance().startAnalysis(this._mediaStatsReport);
    rtcLogger.info(
      LOG_TAG,
      ` Got mediaStats ${JSON.stringify(this._mediaStatsReport)}`,
    );
    if (
      !this._hasReceivedPackages &&
      this._mediaStatsReport.inboundRtpReport &&
      this._mediaStatsReport.inboundRtpReport.packetsReceived > 0
    ) {
      this._hasReceivedPackages = true;
    }
    if (
      !this._hasSentPackages &&
      this._mediaStatsReport.outboundRtpReport &&
      this._mediaStatsReport.outboundRtpReport.packetsSent > 0
    ) {
      this._hasSentPackages = true;
    }
  }

  private _formatMediaStatsReport(mediaStatsReport: any) {
    if (mediaStatsReport.inboundRtpReport) {
      this._mediaStatsReport.inboundRtpReport =
        mediaStatsReport.inboundRtpReport;
    }

    if (mediaStatsReport.outboundRtpReport) {
      this._mediaStatsReport.outboundRtpReport =
        mediaStatsReport.outboundRtpReport;
    }

    if (mediaStatsReport.rttMS) {
      this._mediaStatsReport.rttMS = mediaStatsReport.rttMS;
    }
  }
}

export { RTCMediaStatsManager };
