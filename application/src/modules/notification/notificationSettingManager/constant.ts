/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-29 14:17:54
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const NOTIFICATION_SETTING_SCOPE = Symbol('NotificationSetting');

const SETTING_ITEM__NOTIFICATION_BROWSER =
  SettingEntityIds.Notification_Browser;

enum SETTING_SECTION {
  DESKTOP_NOTIFICATIONS = 'DESKTOP_NOTIFICATIONS',
  EMAIL_NOTIFICATIONS = 'NOTIFICATION_SOUND.EMAIL_NOTIFICATIONS',
  OTHER_NOTIFICATION_SETTINGS = 'OTHER_NOTIFICATION_SETTINGS',
}
export {
  NOTIFICATION_SETTING_SCOPE,
  SETTING_SECTION,
  SETTING_ITEM__NOTIFICATION_BROWSER,
};
