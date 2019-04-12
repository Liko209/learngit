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
  FORWARD = 'forward',
  HOLD = 'hold',
  UNHOLD = 'unhold',
  MUTE = 'mute',
  UNMUTE = 'unmute',
  PARK = 'park',
  START_REPLY = 'startReply',
  REPLY_WITH_MSG = 'replyWithMessage',
  REPLY_WITH_PATTERN = 'replyWithPattern',
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
  INVALID_STATE = 1002,
}

enum RTC_REPLY_MSG_PATTERN {
  WILL_CALL_YOU_BACK_LATER = 'WillCallYouBackLater',
  IN_A_MEETING = 'InAMeeting',
  ON_MY_WAY = 'OnMyWay',
  ON_THE_OTHER_LINE = 'OnTheOtherLine',
  CALL_ME_BACK_LATER = 'CallMeBackLater',
}

enum RTC_REPLY_MSG_TIME_UNIT {
  MINUTE = 'Minute',
  HOUR = 'Hour',
  DAY = 'Day',
}

enum RTC_MEDIA_ACTION {
  INPUT_DEVICE_CHANGED = 'inputDeviceChanged',
  OUTPUT_DEVICE_CHANGED = 'outputDeviceChanged',
}

export {
  RTC_ACCOUNT_STATE,
  RTCCallInfo,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTC_STATUS_CODE,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTCCallOptions,
  RTCCallActionSuccessOptions,
  RTCSipFlags,
  RTC_MEDIA_ACTION,
};
