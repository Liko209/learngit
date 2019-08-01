/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-07-30 11:39:26
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCMediaStatsManager } from '../RTCMediaStatsManager';

describe('Media stats mananger', () => {
  it('should do nothing if packetsReceived less than 0 or equal 0 when get media stats from webrtc. [JPT-2515]', () => {
    const mediaStatsManager = new RTCMediaStatsManager();
    expect(mediaStatsManager.hasReceivedPackages()).toBe(false);
    mediaStatsManager.setMediaStatsReport({
      inboundRtpReport: {
        packetsReceived: 0,
      },
      outboundRtpReport: {
        packetsSent: 0,
      },
    });
    expect(mediaStatsManager.hasReceivedPackages()).toBe(false);
  });

  it('should hasReceivedPackages return true if packetsReceived more than 0 when get media stats from webrtc. [JPT-2516]', () => {
    const mediaStatsManager = new RTCMediaStatsManager();
    expect(mediaStatsManager.hasReceivedPackages()).toBe(false);
    mediaStatsManager.setMediaStatsReport({
      inboundRtpReport: {
        packetsReceived: 1,
      },
      outboundRtpReport: {
        packetsSent: 0,
      },
    });
    expect(mediaStatsManager.hasReceivedPackages()).toBe(true);
  });

  it('should hasSentPackages and hasReceivedPackages to be true if packetSent and packetReceived more than 0 when get media stats from webrtc. [JPT-2517]', () => {
    const mediaStatsManager = new RTCMediaStatsManager();
    expect(mediaStatsManager.hasReceivedPackages()).toBe(false);
    expect(mediaStatsManager.hasSentPackages()).toBe(false);
    mediaStatsManager.setMediaStatsReport({
      inboundRtpReport: {
        packetsReceived: 1,
      },
      outboundRtpReport: {
        packetsSent: 1,
      },
    });
    expect(mediaStatsManager.hasReceivedPackages()).toBe(true);
    expect(mediaStatsManager.hasSentPackages()).toBe(true);
  });

  it('should do nothing if packetSent less than 0 or equal 0 when get media stats from webrtc. [JPT-2518]', () => {
    const mediaStatsManager = new RTCMediaStatsManager();
    expect(mediaStatsManager.hasSentPackages()).toBe(false);
    mediaStatsManager.setMediaStatsReport({
      inboundRtpReport: {
        packetsReceived: 0,
      },
      outboundRtpReport: {
        packetsSent: 0,
      },
    });
    expect(mediaStatsManager.hasSentPackages()).toBe(false);
  });

  it('should hasSentPackages return true if packetsSent more than 0 when get media stats from webrtc. [JPT-2519]', () => {
    const mediaStatsManager = new RTCMediaStatsManager();
    expect(mediaStatsManager.hasSentPackages()).toBe(false);
    mediaStatsManager.setMediaStatsReport({
      inboundRtpReport: {
        packetsReceived: 0,
      },
      outboundRtpReport: {
        packetsSent: 1,
      },
    });
    expect(mediaStatsManager.hasSentPackages()).toBe(true);
  });
});
