/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-04 10:43:32
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from './RTCLoggerProxy';

function isNotEmptyString(data: any): boolean {
  return typeof data === 'string' && data.length > 0;
}

function isFireFox() {
  const userAgent = navigator.userAgent;
  return userAgent && userAgent.indexOf('Firefox') > -1;
}

function isSafari() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent &&
    userAgent.indexOf('safari') > -1 &&
    userAgent.indexOf('chrome') < 0
  );
}

function opusPTInRtpmap(sdp: any): string {
  const opusLine = sdp.find((opusCodecLine: string) => {
    const opusDefRegexp = /a=rtpmap.*opus.*/gi;
    return opusDefRegexp.test(opusCodecLine);
  });
  if (!opusLine) {
    throw new Error('Opus codec is not supported');
  }
  const formatRegexp = /rtpmap:(\d*).*/gi;
  const results = formatRegexp.exec(opusLine);
  return results ? results[1] : '0';
}

function customizedOpusFmtp(
  pt: string,
  maxbitrate: number,
  maxplaybackrate: number,
): string {
  const options = [
    `a=fmtp:${pt}`,
    'minptime=10;',
    'useinbandfec=1;',
    `maxaveragebitrate=${maxbitrate};`,
    `sprop-maxcapturerate=${maxplaybackrate};`,
    `maxplaybackrate=${maxplaybackrate};`,
    'stereo=0;',
    'sprop-stereo=0;',
    'ptime=20',
  ];
  return options.join(' ');
}

function opusModifier(RTCSessionDescription: any): any {
  if (!RTCSessionDescription || !RTCSessionDescription.sdp) {
    return Promise.resolve(RTCSessionDescription);
  }

  const sdp = RTCSessionDescription.sdp.split('\n');

  const maxBitrate = 32000; // bps
  const sampleRate = 16000; // hz
  let pt = '0';

  try {
    pt = opusPTInRtpmap(sdp);
  } catch (e) {
    rtcLogger.error('opusModifier', `${e}`);
    return Promise.resolve(RTCSessionDescription);
  }

  const finalFmtpCodec = sdp.map((sdpLines: any) => {
    const opusParamRegexp = new RegExp(`a=fmtp:${pt}`, 'gi');
    if (opusParamRegexp.test(sdpLines)) {
      return customizedOpusFmtp(pt, maxBitrate, sampleRate);
    }
    return sdpLines;
  });

  RTCSessionDescription.sdp = finalFmtpCodec.join('\n');

  rtcLogger.debug('opusModifier', `Final SDP  ${RTCSessionDescription.sdp}`);

  return Promise.resolve(RTCSessionDescription);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export {
  isNotEmptyString,
  opusModifier,
  customizedOpusFmtp,
  opusPTInRtpmap,
  isFireFox,
  isSafari,
  randomBetween,
};
