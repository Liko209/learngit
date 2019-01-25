/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:30:06
 * Copyright © RingCentral. All rights reserved.
 */
enum RTC_ACCOUNT_STATE {
  IDLE = 'Idle',
  REGISTERED = 'Registered',
  FAILED = 'Failed',
  UNREGISTERED = 'Unregistered',
  IN_PROGRESS = 'InProgress',
}

type RTCCallInfo = {
  fromName: string;
  fromNum: string;
  toName: string;
  toNum: string;
  uuid: string;
};

type RTCCallOptions = {
  fromNumber?: string;
  homeCountryId?: string;
};

type RTCCallActionSuccessOptions = {
  parkExtension?: string;
};

enum RTC_CALL_STATE {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

enum RTC_CALL_ACTION {
  FLIP = 'flip',
  START_RECORD = 'startRecord',
  STOP_RECORD = 'stopRecord',
  TRANSFER = 'transfer',
  HOLD = 'hold',
  UNHOLD = 'unhold',
  MUTE = 'mute',
  UNMUTE = 'unmute',
  PARK = 'park',
}

type RTCOutBoundRtp = {
  bytesSent: number;
  codecId: string;
  id: string;
  isRemote: boolean;
  mediaType: string;
  packetsSent: number;
  ssrc: number;
  timestamp: number;
  trackId: string;
  transportId: string;
  type: string;
  currentRoundTripTime: number;
};

type RTCInBoundRtp = {
  bytesReceived: number;
  codecId: string;
  fractionLost: number;
  id: string;
  isRemote: boolean;
  jitter: number;
  mediaType: string;
  packetsLost: number;
  packetsReceived: number;
  ssrc: number;
  timestamp: number;
  trackId: string;
  transportId: string;
  type: string;
  currentRoundTripTime: number;
};

export {
  RTC_ACCOUNT_STATE,
  RTCCallInfo,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallOptions,
  RTCCallActionSuccessOptions,
  RTCInBoundRtp,
  RTCOutBoundRtp,
};
