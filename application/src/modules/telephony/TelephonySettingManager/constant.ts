/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 16:58:50
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const SETTING_PAGE__PHONE = 'PHONE';
const SETTING_SECTION__PHONE_GENERAL = 'PHONE.GENERAL';

enum PHONE_SETTING_ITEM {
  NOTIFICATION_CALLS_VOICEMAILS = SettingEntityIds.Notification_MissCallAndNewVoiceMails,
  NOTIFICATION_INCOMING_CALLS = SettingEntityIds.Notification_IncomingCalls,
  PHONE_DEFAULT_PHONE_APP = SettingEntityIds.Phone_DefaultApp,
  PHONE_CALLER_ID = SettingEntityIds.Phone_CallerId,
  PHONE_REGION = SettingEntityIds.Phone_Region,
  PHONE_EXTENSIONS = SettingEntityIds.Phone_Extension,
  SOUND_INCOMING_CALL = SettingEntityIds.Audio_IncomingCalls,
  SOUND_VOICE_MAIL = SettingEntityIds.Audio_NewVoicemail,
  PHONE_E911 = SettingEntityIds.Phone_E911,
}
export {
  PHONE_SETTING_ITEM,
  SETTING_PAGE__PHONE,
  SETTING_SECTION__PHONE_GENERAL,
};
