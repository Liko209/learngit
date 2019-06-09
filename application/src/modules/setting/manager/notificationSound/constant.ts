/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 12:59:05
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const SETTING_PAGE__NOTIFICATION_SOUND = 'NOTIFICATION_SOUND';
const SETTING_SECTION__SOUNDS = 'NOTIFICATION_SOUND.SOUNDS';
const SETTING_SECTION__AUDIO_SOURCE = 'NOTIFICATION_SOUND.AUDIO_SOURCE';
const SETTING_ITEM__MICROPHONE_SOURCE = SettingEntityIds.Phone_MicrophoneSource;
const SETTING_ITEM__SPEAKER_SOURCE = SettingEntityIds.Phone_SpeakerSource;
const SETTING_ITEM__VOLUME = SettingEntityIds.Phone_Volume;

export {
  SETTING_PAGE__NOTIFICATION_SOUND,
  SETTING_SECTION__SOUNDS,
  SETTING_SECTION__AUDIO_SOURCE,
  SETTING_ITEM__MICROPHONE_SOURCE,
  SETTING_ITEM__SPEAKER_SOURCE,
  SETTING_ITEM__VOLUME,
};
