/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-07 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingModuleIds } from 'sdk/module/setting';

const SETTING_ITEM = {
  [SettingModuleIds.GeneralSetting.id]: {
    title: 'setting.general.title',
    icon: 'settings',
    type: 'general',
    testId: 'entry-general',
    range: SettingModuleIds.GeneralSetting.idRange,
  },
  [SettingModuleIds.NotificationSetting.id]: {
    title: 'setting.notificationAndSounds.title',
    icon: 'bell',
    type: 'notification_and_sounds',
    testId: 'entry-notificationAndSounds',
    range: SettingModuleIds.NotificationSetting.idRange,
  },
  [SettingModuleIds.MessageSetting.id]: {
    title: 'setting.messages.title',
    icon: 'bubble_lines',
    type: 'messages',
    testId: 'entry-messages',
    range: SettingModuleIds.MessageSetting.idRange,
  },
  [SettingModuleIds.PhoneSetting.id]: {
    title: 'setting.phone.title',
    icon: 'phone',
    type: 'phone',
    testId: 'entry-phone',
    range: SettingModuleIds.PhoneSetting.idRange,
  },
  [SettingModuleIds.MeetingSetting.id]: {
    title: 'setting.meetings.title',
    icon: 'videocam',
    type: 'meetings',
    testId: 'entry-meetings',
    range: SettingModuleIds.MeetingSetting.idRange,
  },
  [SettingModuleIds.CalendarSetting.id]: {
    title: 'setting.calendar.title',
    icon: 'event_new',
    type: 'calendar',
    testId: 'entry-calendar',
    range: SettingModuleIds.CalendarSetting.idRange,
  },
  [SettingModuleIds.PhoneSetting_General.id]: {
    title: 'setting.phone.general.title',
    icon: 'event_new',
    type: 'calendar',
    testId: 'entry-calendar',
    range: [],
  },
  [SettingModuleIds.PhoneSetting_AudioSource.id]: {
    title: 'setting.phone.audioSource.title',
    icon: 'event_new',
    type: 'calendar',
    testId: 'entry-calendar',
    range: [],
  },
};

export { SETTING_ITEM };
