/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 16:58:50
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const SETTING_PAGE__PHONE = 'PHONE';
const SETTING_SECTION__PHONE_GENERAL = 'PHONE.GENERAL';
<<<<<<< HEAD
=======
const SETTING_ITEM__PHONE_DEFAULT_PHONE_APP = SettingEntityIds.Phone_DefaultApp;
const SETTING_ITEM__PHONE_CALLER_ID = SettingEntityIds.Phone_CallerId;
const SETTING_ITEM__PHONE_REGION = SettingEntityIds.Phone_Region;
const SETTING_ITEM__PHONE_EXTENSIONS = SettingEntityIds.Phone_Extension;
const SETTING_ITEM__PHONE_E911 = SettingEntityIds.Phone_E911;

const SETTING_ITEM__NOTIFICATION_INCOMING_CALLS =
  SettingEntityIds.Notification_IncomingCalls;
const SETTING_ITEM__NOTIFICATION_CALLS_VOICEMAILS =
  SettingEntityIds.Notification_MissCallAndNewVoiceMails;
>>>>>>> origin/develop

enum PHONE_SETTING_ITEM {
  NOTIFICATION_CALLS_VOICEMAILS = SettingEntityIds.Notification_MissCallAndNewVoiceMails,
  NOTIFICATION_INCOMING_CALLS = SettingEntityIds.Notification_IncomingCalls,
  PHONE_DEFAULT_PHONE_APP = SettingEntityIds.Phone_DefaultApp,
  PHONE_CALLER_ID = SettingEntityIds.Phone_CallerId,
  PHONE_REGION = SettingEntityIds.Phone_Region,
  PHONE_EXTENSIONS = SettingEntityIds.Phone_Extension,
  SOUND_INCOMING_CALL = SettingEntityIds.Audio_IncomingCalls,
  SOUND_VOICE_MAIL = SettingEntityIds.Audio_NewVoicemail,
}
export {
  PHONE_SETTING_ITEM,
  SETTING_PAGE__PHONE,
  SETTING_SECTION__PHONE_GENERAL,
<<<<<<< HEAD
=======
  SETTING_ITEM__PHONE_CALLER_ID,
  SETTING_ITEM__PHONE_REGION,
  SETTING_ITEM__PHONE_EXTENSIONS,
  SETTING_ITEM__PHONE_DEFAULT_PHONE_APP,
  SETTING_ITEM__PHONE_E911,
  SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
  SETTING_ITEM__NOTIFICATION_CALLS_VOICEMAILS,
>>>>>>> origin/develop
};
