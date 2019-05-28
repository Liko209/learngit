/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-12 14:49:36
 * Copyright © RingCentral. All rights reserved.
 */

import { ISpecialServiceNumber, DialingCountryInfo } from 'sdk/api';

enum ERCServiceFeaturePermission {
  VOIP_CALLING,
  INTERNATIONAL_CALLING,
  ON_DEMAND_CALL_RECORDING,
  CALL_PARK,
  CALL_TRANSFER,
  CALL_FLIP,
  BUSINESS_SMS,
  SMS_SEND,
  SMS_RECEIVE,
  PAGER_SEND,
  PAGER_RECEIVING,
  CONFERENCING,
  VIDEO_CONFERENCING,
  READ_BLOCKED_PHONE_NUMBER,
  EDIT_BLOCKED_PHONE_NUMBER,
  READ_COMPANY_CALLLOG,
  FAX,
  FAX_RECEIVE,
  EXTENSION_SETTINGS,
  VOICE_MAIL_TRANSCRIPTION,
  RINGOUT_CALL,
  INTERNAL_CALLS,
  DOMESTIC_CALLS,
  SINGLE_EXTENSION_UI,
  RINGCENTRAL_MOBILE_APP,
  PHONE_SYSTEM,
  BILLING,
  HISTORICAL_REPORTS,
  LIVE_REPORTS,
  QUALITY_OF_SERVICE,
  EMBEDDED_FLAG,
  DND,
  CALL_SWITCH,
  RC_PRESENCE,
  MOBILE_VOIP_EMERGENCY_CALLING,
  CALL_FORWARDING,
}

enum PermissionId {
  INTERNAL_CALLS = 'InternalCalls',
  DOMESTIC_CALLS = 'DomesticCalls',
  INTERNATIONAL_CALLS = 'InternationalCalls',
  INTERNATIONAL_CALLING = 'InternationalCalling',
  READ_COMPANY_CALLLOG = 'ReadCompanyCallLog',
  INTERNAL_SMS = 'InternalSMS',
  PERMISSION_MEEINGS = 'Meetings',
}

enum RCServiceFeatureName {
  VOIP_CALLING = 'VoipCalling',
  INTERNATIONAL_CALLING = 'InternationalCalling',
  CALL_PARK = 'CallPark',
  SINGLE_EXTENSION_UI = 'SingleExtensionUI',
  CALL_SWITCH = 'CallSwitch',
  PAGER = 'Pager',
  FAX = 'Fax',
  VIDEO_CONFERENCING = 'VideoConferencing',
  CALL_FORWARDING = 'CallForwarding',
}

enum RCBrandType {
  RINGCENTRAL,
  RINGCENTRAL_UK,
  ATT,
  TELUS,
  OTHER,
}

type SpecialNumberRuleModel = {
  [key: number]: ISpecialServiceNumber;
};

type StationLocationSetting = {
  countryInfo: DialingCountryInfo;
  areaCode: string;
  areaCodeByManual: boolean;
  countryByManual: boolean;
};

type GlobalStationLocationSetting = {
  [userId: number]: StationLocationSetting;
};

type RegionInfo = {
  countryCode: string;
  areaCode: string;
};

enum ERCWebSettingUri {
  BILLING_URI,
  PHONE_SYSTEM_URI,
  EXTENSION_URI,
  ANALYTIC_PORTAL_URI,
}

enum EForwardingFlipNumberType {
  HOME,
  WORK,
  MOBILE,
  PHONE_LINE,
  OUTAGE,
  OTHER,
}

type ForwardingFlipNumberModel = {
  label: string;
  phoneNumber: string;
  flipNumber: number;
  type: EForwardingFlipNumberType;
};

enum EGetForwardingFlipNumberType {
  FORWARDING = 'CallForwarding',
  FLIP = 'CallFlip',
}

export {
  RCServiceFeatureName,
  PermissionId,
  ERCServiceFeaturePermission,
  RCBrandType,
  SpecialNumberRuleModel,
  StationLocationSetting,
  ERCWebSettingUri,
  GlobalStationLocationSetting,
  RegionInfo,
  EForwardingFlipNumberType,
  ForwardingFlipNumberModel,
  EGetForwardingFlipNumberType,
};
