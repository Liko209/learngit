/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:35:55
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService, SETTING_ITEM_TYPE } from '@/interface/setting';
import { SETTING_SECTION__DESKTOP_NOTIFICATIONS } from '@/modules/notification/notificationSettingManager/constant';
import {
  MESSAGE_SETTING_SCOPE,
  SETTING_ITEM__NOTIFICATION_NEW_MESSAGES,
} from './interface/constant';
import { IMessageSettingManager } from './interface';

class MessageSettingManager implements IMessageSettingManager {
  @ISettingService private _settingService: ISettingService;

  async init() {
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      {
        id: SETTING_ITEM__NOTIFICATION_NEW_MESSAGES,
        title:
          'setting.notificationAndSounds.desktopNotifications.newMessages.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.newMessages.description',
        type: SETTING_ITEM_TYPE.SELECT,
        weight: 200,
      },
    );
  }

  dispose() {
    this._settingService.unRegisterAll(MESSAGE_SETTING_SCOPE);
  }
}

export { MessageSettingManager };
