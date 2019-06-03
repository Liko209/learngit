/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-29 14:17:54
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const NOTIFICATION_SETTING_SCOPE = Symbol('NotificationSetting');

const SETTING_SECTION__DESKTOP_NOTIFICATIONS =
  'NOTIFICATION_SOUND.DESKTOP_NOTIFICATIONS';

const SETTING_ITEM__NOTIFICATION_BROWSER =
  SettingEntityIds.Notification_Browser;

const SETTING_SECTION__EMAIL_NOTIFICATIONS =
  'NOTIFICATION_SOUND.EMAIL_NOTIFICATIONS';

export {
  NOTIFICATION_SETTING_SCOPE,
  SETTING_SECTION__DESKTOP_NOTIFICATIONS,
  SETTING_SECTION__EMAIL_NOTIFICATIONS,
  SETTING_ITEM__NOTIFICATION_BROWSER,
};
