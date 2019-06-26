import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

export const TELEPHONY_SERVICE = 'TELEPHONY_SERVICE';
export const ANONYMOUS = 'anonymous';
export const DIALING = 'dialing';
export const INITIAL_REPLY_COUNTDOWN_TIME = 55;

export const SETTING_ITEM__NOTIFICATION_INCOMING_CALLS =
  SettingEntityIds.Notification_IncomingCalls;

export enum CALL_ACTION {
  FORWARD,
  PARK,
  REPLY,
  FLIP,
}
export const CONTACT_SEARCH_PHONE_NUMBER_ID =
  'TELEPHONY-CONTACT_SEARCH_PHONE_NUMBER_ID-0';

export enum INCOMING_STATE {
  IDLE,
  REPLY,
  FORWARD,
}

export enum CALL_TYPE {
  NULL,
  INBOUND,
  OUTBOUND,
}
