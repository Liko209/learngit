/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 16:46:28
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService, SettingItem } from '@/interface/setting';
import { SETTING_PAGE__NOTIFICATION_SOUND } from '@/modules/setting/manager/notificationSound/constant';
import {
  NOTIFICATION_SETTING_SCOPE,
  SETTING_SECTION__DESKTOP_NOTIFICATIONS,
  SETTING_ITEM__NOTIFICATION_BROWSER,
} from './constant';
import { NotificationBrowserSettingItem } from './NotificationBrowserSettingItem';
import { isElectron } from '@/common/isUserAgent';
import { INotificationSettingManager } from '../interface';

class NotificationSettingManager implements INotificationSettingManager {
  @ISettingService private _settingService: ISettingService;

  init = async () => {
    const notificationItems: SettingItem[] = [];
    if (!isElectron) {
      notificationItems.push({
        id: SETTING_ITEM__NOTIFICATION_BROWSER,
        automationId: 'notificationBrowser',
        type: NotificationBrowserSettingItem,
        weight: 100,
      });
    }
    this._settingService.registerSection(
      NOTIFICATION_SETTING_SCOPE,
      SETTING_PAGE__NOTIFICATION_SOUND,
      {
        id: SETTING_SECTION__DESKTOP_NOTIFICATIONS,
        automationId: 'desktopNotifications',
        title: 'setting.notificationAndSounds.desktopNotifications.title',
        weight: 100,
        items: notificationItems,
      },
    );
  }
  dispose() {
    this._settingService.unRegisterAll(NOTIFICATION_SETTING_SCOPE);
  }
}

export { NotificationSettingManager };
