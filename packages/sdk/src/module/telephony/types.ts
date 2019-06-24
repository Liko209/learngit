/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 13:29:13
 * Copyright © RingCentral. All rights reserved.
 */
import { RTC_ACCOUNT_STATE, RTC_CALL_STATE } from 'voip';

enum FEATURE_PERMISSIONS {
  VOIP_CALLING = 'VoipCalling',
  INTERNATIONAL_CALLING = 'InternationalCalling',
}

enum E911_STATUS {
  NOT_RESPONDED,
  ACCEPTED,
  DISCLINED,
}

type TelephonyCallInfo = {
  fromName?: string;
  fromNum: string;
  toName?: string;
  toNum: string;
  callId: string;
};

enum MAKE_CALL_ERROR_CODE {
  NO_ERROR,
  E911_ACCEPT_REQUIRED,
  N11_101,
  N11_102,
  N11_OTHERS,
  N11_101_RINGOUT,
  N11_102_RINGOUT,
  N11_105_RINGOUT,
  N11_OTHERS_RINGOUT,
  N11_FAX,
  INVALID_EXTENSION_NUMBER,
  INVALID_PHONE_NUMBER,
  NO_INTERNATIONAL_CALLS_PERMISSION,
  NO_INTERNET_CONNECTION,
  SPECIAL_NUMBER,
  INTERNALTION_CALLS_BUT_IS_TRIAL_ACCOUNT,
  RING_OUT_ONE_LEG,
  THE_COUNTRY_BLOCKED_VOIP_REQUIRE_RINGOUT,
  THE_COUNTRY_BLOCKED_VOIP,
  VOIP_CALLING_SERVICE_UNAVAILABLE_REQUIRE_RINGOUT,
  VOIP_CALLING_SERVICE_UNAVAILABLE,
  RINGOUT_DIAL_IN,
  NOT_SUPPORT_CALL_SWITCH_FOR_WIFI_OR_CARRIER_MINUTES,
  NOT_SUPPORT_CALL_SWITCH_FOR_CARRIER_MINUTES_ONLY,
  MAX_CALLS_REACHED,
  INVALID_STATE,
}

type LogoutCallback = () => void;

export {
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
  FEATURE_PERMISSIONS,
  MAKE_CALL_ERROR_CODE,
  E911_STATUS,
  TelephonyCallInfo,
  LogoutCallback,
};
