/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

enum SETTING_LIST_TYPE {
  general = 'general',
  notificationAndSounds = 'notification_and_sounds',
  messaging = 'messaging',
  phone = 'phone',
  meetings = 'meetings',
  calendar = 'calendar',
}

type SettingLeftRailEntry = {
  title: string;
  icon: string;
  type: SETTING_LIST_TYPE;
  testId: string;
};

type SettingLeftRailProps = {
  entries: SettingLeftRailEntry[];
  currentSettingListType: string;
  type: SETTING_LIST_TYPE;
};

type SettingLeftRailViewProps = {
  entries: SettingLeftRailEntry[];
  currentSettingListType: SETTING_LIST_TYPE;
};

export {
  SETTING_LIST_TYPE,
  SettingLeftRailEntry,
  SettingLeftRailProps,
  SettingLeftRailViewProps,
};
