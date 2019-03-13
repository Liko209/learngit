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
  partyId: string;
  sessionId: string;
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
  CALL_TIME_OUT = 'callTimeOut',
}

type RTCSipFlags = {
  voipFeatureEnabled: boolean;
  voipCountryBlocked: boolean;
  outboundCallsEnabled: boolean;
  dscpEnabled: boolean;
  dscpSignaling: Number;
  dscpVoice: Number;
  dscpVideo: Number;
};

enum RTC_STATUS_CODE {
  OK = 0,
  NUMBER_INVALID = 1000,
  MAX_CALLS_REACHED = 1001,
}

export {
  RTC_ACCOUNT_STATE,
  RTCCallInfo,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTC_STATUS_CODE,
  RTCCallOptions,
  RTCCallActionSuccessOptions,
  RTCSipFlags,
};
