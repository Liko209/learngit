/*
 * @Author: Spike.Yang
 * @Date: 2019-05-13 14:12:08
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaReport } from '../Media';

const mockMediaStats = [
  {
    inboundRtpReport: {
      mediaType: 'audio',
      packetsReceived: 105,
      bytesReceived: 8998,
      packetsLost: 0,
      jitter: 0.01,
      fractionLost: 0.5,
    },
    outboundRtpReport: { mediaType: 'audio', packetsSent: 98, bytesSent: 8078 },
    rttMS: { currentRoundTripTime: 13 },
  },
  {
    inboundRtpReport: {
      mediaType: 'audio',
      packetsReceived: 204,
      bytesReceived: 18203,
      packetsLost: 0,
      jitter: 0.01,
      fractionLost: 0.3,
    },
    outboundRtpReport: {
      mediaType: 'audio',
      packetsSent: 197,
      bytesSent: 16786,
    },
    rttMS: { currentRoundTripTime: 10 },
  },
  {
    inboundRtpReport: {
      mediaType: 'audio',
      packetsReceived: 305,
      bytesReceived: 27581,
      packetsLost: 0,
      jitter: 0.01,
      fractionLost: 0,
    },
    outboundRtpReport: {
      mediaType: 'audio',
      packetsSent: 297,
      bytesSent: 25465,
    },
    rttMS: { currentRoundTripTime: 38 },
  },
  {
    inboundRtpReport: {
      mediaType: 'audio',
      packetsReceived: 403,
      bytesReceived: 36577,
      packetsLost: 0,
      jitter: 0.016,
      fractionLost: 0,
    },
    outboundRtpReport: {
      mediaType: 'audio',
      packetsSent: 397,
      bytesSent: 34871,
    },
    rttMS: { currentRoundTripTime: 9 },
  },
];

const mockOutCome = {
  bytesReceived: {
    variance: 184.11658,
    average: 9144.25,
    max: 9378,
    min: 8996,
  },
  bytesSent: { variance: 543.00545, average: 8717.75, max: 9406, min: 8078 },
  jitter: { variance: 0.003, average: 0.0115, max: 0.016, min: 0.01 },
  packetsLost: { variance: 0, average: 0, max: 0, min: 0 },
  packetsReceived: { variance: 3.0957, average: 100.75, max: 105, min: 98 },
  packetsSent: { variance: 0.95743, average: 99.25, max: 100, min: 98 },
  fractionLost: { variance: 0.24495, average: 0.2, max: 0.5, min: 0 },
  currentRoundTripTime: { variance: 13.77195, average: 17.5, max: 38, min: 9 }
};

describe('Check min,max,average,variance of Media report parameters during call state is connected [JPT-1939]', () => {
  it('should return null when passing in null', () => {
    const mediaReport = new MediaReport();
    mediaReport.startAnalysis(null);
    const outcome = mediaReport.stopAnalysis();
    expect(outcome).toBe(null);
  });

  it("should return correct value for min,max,average,variance of 'packetsReceived' ,'bytesReceived','packetsLost','jitter','packetsSent','bytesSent' when end record [JPT-1939]", async () => {
    const mediaReport = new MediaReport();
    for (const stat of mockMediaStats) {
      mediaReport.startAnalysis(stat);
    }

    const outcome = mediaReport.stopAnalysis();
    expect(outcome).toEqual(mockOutCome);
  });
});
