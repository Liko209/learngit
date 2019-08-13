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
  fromTag?: string;
  toTag?: string;
  callId?: string;
};

type RTCCallOptions = {
  fromNumber?: string;
  homeCountryId?: string;
  replacesCallId?: string;
  replacesFromTag?: string;
  replacesToTag?: string;
  extraCall?: boolean;
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
  WARM_TRANSFER = 'warmTransfer',
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

enum RTC_CALL_ACTION_ERROR_CODE {
  INVALID = -1,
  OTHER_ACTION_IN_PROGRESS = -6,
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

type RTCSipEmergencyServiceAddr = {
  street: string;
  street2: string;
  city: string;
  state: string;
  stateId: string;
  stateIsoCode: string;
  stateName: string;
  country: string;
  countryId: string;
  countryIsoCode: string;
  countryName: string;
  zip: string;
  customerName: string;
  outOfCountry: boolean;
};

type RTCSipDevice = {
  uri: string;
  id: string;
  type: string;
  status: string;
  emergencyServiceAddress?: RTCSipEmergencyServiceAddr;
};

type RTCSipInfo = {
  transport: string;
  password: string;
  domain: string;
  username: string;
  authorizationId: string;
  outboundProxy: string;
  outboundProxyBackup?: string;
  switchBackInterval?: number;
};

type RTCSipProvisionInfo = {
  device: RTCSipDevice;
  sipInfo: RTCSipInfo[];
  sipFlags: RTCSipFlags;
  sipErrorCodes?: string[];
};

type RTCUserInfo = {
  endpointId?: string;
  userAgent?: string;
  rcBrandId?: string;
  rcAccountId?: number;
  rcExtensionId?: number;
};

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
  INPUT_DEVICE_LIST_CHANGED = 'inputDeviceListChanged',
  OUTPUT_DEVICE_LIST_CHANGED = 'outputDeviceListChanged',
  VOLUME_CHANGED = 'VOLUME_CHANGED',
}

enum RECORD_STATE {
  IDLE = 'idle',
  RECORDING = 'recording',
  START_RECORD_IN_PROGRESS = 'startRecordInProgress',
  STOP_RECORD_IN_PROGRESS = 'stopRecordInProgress',
}

enum RTC_NO_AUDIO_TYPE {
  NO_RTP = 'no-rtp',
  NO_RTP_INCOMING = 'no-rtp-incoming',
  NO_RTP_OUTGOING = 'no-rtp-outgoing',
}

type RTCNoAudioStateEvent = {
  event: {
    type: 'success';
    timestamp?: number;
    details: {
      feature: 'no_audio_data';
      build_type?: string;
      user_id?: string;
      company_id?: string;
    };
  };
};

type RTCNoAudioDataEvent = {
  event: {
    type: 'no-rtp';
    timestamp?: number;
    details: {
      feature: 'no_audio_data';
      build_type?: string;
      user_id?: string;
      company_id?: string;
      data: {
        call_type: string;
        user_agent: string;
        mailbox_id?: string;
        account_id?: string;
        session_time: number;
        type: RTC_NO_AUDIO_TYPE;
        call_info: {
          to_tag: string;
          to_number: string;
          to_name: string;
          call_id: string;
          from_tag: string;
          from_number: string;
          from_name: string;
        };
      };
    };
  };
};

enum ALLOW_CALL_FLAG {
  OUTBOUND_CALL = 'outboundCall',
  EXTRA_OUTBOUND_CALL = 'extraOutboundCall',
  INBOUND_CALL = 'inboundCall',
}

export {
  RTC_ACCOUNT_STATE,
  RTCCallInfo,
  RTCUserInfo,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTC_CALL_ACTION_ERROR_CODE,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTCCallOptions,
  RTCCallActionSuccessOptions,
  RTCSipFlags,
  RTC_MEDIA_ACTION,
  RECORD_STATE,
  RTC_NO_AUDIO_TYPE,
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
  RTCSipProvisionInfo,
  RTCSipEmergencyServiceAddr,
  ALLOW_CALL_FLAG,
};
