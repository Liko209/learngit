/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 13:29:13
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
  RTCSipEmergencyServiceAddr as EmergencyServiceAddress,
  RTCCallOptions,
  RTCSipProvisionInfo as SipProvisionInfo,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
} from 'voip';
import { CALL_DIRECTION } from './entity';

enum FEATURE_PERMISSIONS {
  VOIP_CALLING = 'VoipCalling',
  INTERNATIONAL_CALLING = 'InternationalCalling',
}

enum E911_STATUS {
  NOT_RESPONDED,
  ACCEPTED,
  DISCLINED,
}

type notificationCallback = (...values: any[]) => void;

type TelephonyCallInfo = {
  fromName?: string;
  fromNum: string;
  toName?: string;
  toNum: string;
  callId: string;
};

enum MAKE_CALL_ERROR_CODE {
  NO_ERROR = 'NO_ERROR',
  E911_ACCEPT_REQUIRED = 'E911_ACCEPT_REQUIRED',
  N11_101 = 'N11_101',
  N11_102 = 'N11_102',
  N11_OTHERS = 'N11_OTHERS',
  N11_101_RINGOUT = 'N11_101_RINGOUT',
  N11_102_RINGOUT = 'N11_102_RINGOUT',
  N11_105_RINGOUT = 'N11_105_RINGOUT',
  N11_OTHERS_RINGOUT = 'N11_OTHERS_RINGOUT',
  N11_FAX = 'N11_FAX',
  INVALID_EXTENSION_NUMBER = 'INVALID_EXTENSION_NUMBER',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  NO_INTERNATIONAL_CALLS_PERMISSION = 'NO_INTERNATIONAL_CALLS_PERMISSION',
  NO_INTERNET_CONNECTION = 'NO_INTERNET_CONNECTION',
  SPECIAL_NUMBER = 'SPECIAL_NUMBER',
  INTERNALTION_CALLS_BUT_IS_TRIAL_ACCOUNT = 'INTERNALTION_CALLS_BUT_IS_TRIAL_ACCOUNT',
  RING_OUT_ONE_LEG = 'RING_OUT_ONE_LEG',
  THE_COUNTRY_BLOCKED_VOIP_REQUIRE_RINGOUT = 'THE_COUNTRY_BLOCKED_VOIP_REQUIRE_RINGOUT',
  THE_COUNTRY_BLOCKED_VOIP = 'THE_COUNTRY_BLOCKED_VOIP',
  VOIP_CALLING_SERVICE_UNAVAILABLE_REQUIRE_RINGOUT = 'VOIP_CALLING_SERVICE_UNAVAILABLE_REQUIRE_RINGOUT',
  VOIP_CALLING_SERVICE_UNAVAILABLE = 'VOIP_CALLING_SERVICE_UNAVAILABLE',
  RINGOUT_DIAL_IN = 'RINGOUT_DIAL_IN',
  NOT_SUPPORT_CALL_SWITCH_FOR_WIFI_OR_CARRIER_MINUTES = 'NOT_SUPPORT_CALL_SWITCH_FOR_WIFI_OR_CARRIER_MINUTES',
  NOT_SUPPORT_CALL_SWITCH_FOR_CARRIER_MINUTES_ONLY = 'NOT_SUPPORT_CALL_SWITCH_FOR_CARRIER_MINUTES_ONLY',
  MAX_CALLS_REACHED = 'MAX_CALLS_REACHED',
  INVALID_STATE = 'INVALID_STATE',
}

type LogoutCallback = () => void;

enum CALL_ACTION_ERROR_CODE {
  NO_ERROR = 0,
  INVALID = -1,
  OTHER_ACTION_IN_PROGRESS = -6,
  ACR_ON = -8,
  NOT_NETWORK = -9,
  INVALID_PHONE_NUMBER = -10,
  OTHERS,
}

interface CallDelegate {
  onCallStateChange(callId: number, state: RTC_CALL_STATE): void;
  onCallActionSuccess(
    callId: number,
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ): void;
  onCallActionFailed(
    callId: number,
    callAction: RTC_CALL_ACTION,
    code: number,
  ): void;
}

type TelephonyDataCollectionInfoUserInfoType = {
  userId: number;
  companyId: number;
};

type TelephonyDataCollectionInfoConfigType = {
  isProduction: boolean;
  userInfo: TelephonyDataCollectionInfoUserInfoType;
};

enum RINGER_ADDITIONAL_TYPE {
  ALL = 'all',
  OFF = 'off',
  DEFAULT = 'default',
}

type CallOptions = RTCCallOptions & {
  replaceName?: string;
  replaceNumber?: string;
  callDirection?: CALL_DIRECTION;
  accessCode?: string;
  extraCall?: boolean;
};

enum TRANSFER_TYPE {
  BLIND_TRANSFER,
  TO_VOICEMAIL,
  WARM_TRANSFER,
}

export {
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
  FEATURE_PERMISSIONS,
  MAKE_CALL_ERROR_CODE,
  E911_STATUS,
  TelephonyCallInfo,
  LogoutCallback,
  CALL_ACTION_ERROR_CODE,
  RINGER_ADDITIONAL_TYPE,
  CallOptions,
  EmergencyServiceAddress,
  TelephonyDataCollectionInfoConfigType,
  SipProvisionInfo,
  notificationCallback,
  CallDelegate,
  TRANSFER_TYPE,
};
