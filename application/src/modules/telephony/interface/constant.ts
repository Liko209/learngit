import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';
import {
  ROUTE_ROOT_PATH,
  kDefaultPhoneTabPath,
} from '../../phone/container/LeftRail/constant';

export const TELEPHONY_SERVICE = 'TELEPHONY_SERVICE';
export const ANONYMOUS_NUM = 'anonymous';
export const ANONYMOUS_NAME = 'Anonymous';
export const DIALING = 'dialing';
export const INITIAL_REPLY_COUNTDOWN_TIME = 55;
export const NOTIFY_THROTTLE_FACTOR = 5000;
export const VOICEMAILS_ROOT_PATH = `${ROUTE_ROOT_PATH}/voicemail`;
export const CALL_LOG_ROOT_PATH = kDefaultPhoneTabPath;
export const ACTION_NAME_CALL_BACK = 'callback';

export const SETTING_ITEM__NOTIFICATION_INCOMING_CALLS =
  SettingEntityIds.Notification_IncomingCalls;

export const SETTING_ITEM__NOTIFICATION_MISS_CALL_AND_NEW_VOICEMAILS =
  SettingEntityIds.Notification_MissCallAndNewVoiceMails;

export const NOTIFICATION_NEW_VOICEMAILS_UUID_PREFIX = 'NEW_VOICEMAILS_UUID_';

export const NOTIFICATION_MISSED_CALL_UUID_PREFIX = 'MISSED_CALL_UUID_';

export enum CALL_ACTION {
  TRANSFER,
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
