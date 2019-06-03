/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:35:55
 * Copyright © RingCentral. All rights reserved.
 */

import {
  SettingItem,
  ISettingService,
  SETTING_ITEM_TYPE,
  SelectSettingItem,
} from '@/interface/setting';
import {
  SETTING_SECTION__DESKTOP_NOTIFICATIONS,
  SETTING_SECTION__EMAIL_NOTIFICATIONS,
  SETTING_SECTION__OTHER_NOTIFICATION_SETTINGS,
} from '@/modules/notification/notificationSettingManager/constant';
import {
  MESSAGE_SETTING_SCOPE,
  MESSAGE_SETTING_ITEM,
} from '../interface/constant';
import { IMessageSettingManager } from '../interface';
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import { NewMessageSelectSourceItem } from './NewMessageSelectSourceItem';
import { buildTitleAndDesc } from '@/modules/setting/utils';
class MessageSettingManager implements IMessageSettingManager {
  @ISettingService private _settingService: ISettingService;

  async init() {
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_NEW_MESSAGES,
        automationId: 'newMessages',
        title:
          'setting.notificationAndSounds.desktopNotifications.newMessages.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.newMessages.description',
        type: SETTING_ITEM_TYPE.SELECT,
        sourceRenderer: NewMessageSelectSourceItem,
        weight: 200,
      } as SelectSettingItem<DESKTOP_MESSAGE_NOTIFICATION_OPTIONS>,
    );
    const emailNotificationTitleAndDescBuilder = buildTitleAndDesc(
      'notificationAndSounds',
      'emailNotifications',
    );
    const emailNotificationSettingItems: SettingItem[] = [
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_DIRECT_MESSAGES,
        automationId: 'notificationDirectMessages',
        weight: 100,
        type: SETTING_ITEM_TYPE.SELECT,

        ...emailNotificationTitleAndDescBuilder('directMessages'),
      },
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_MENTIONS,
        automationId: 'notificationMentions',
        weight: 200,
        type: SETTING_ITEM_TYPE.TOGGLE,
        ...emailNotificationTitleAndDescBuilder('mentions'),
      },
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_TEAMS,
        automationId: 'notificationTeams',
        type: SETTING_ITEM_TYPE.SELECT,
        weight: 300,
        ...emailNotificationTitleAndDescBuilder('teams'),
      },
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_DAILY_DIGEST,
        automationId: 'notificationDailyDigest',
        weight: 400,
        type: SETTING_ITEM_TYPE.TOGGLE,
        ...emailNotificationTitleAndDescBuilder('dailyDigest'),
      },
    ];

    emailNotificationSettingItems.forEach((i) =>
      this._settingService.registerItem(
        MESSAGE_SETTING_SCOPE,
        SETTING_SECTION__EMAIL_NOTIFICATIONS,
        i,
      ),
    );
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION__OTHER_NOTIFICATION_SETTINGS,
      {
        id: MESSAGE_SETTING_ITEM.NEW_MESSAGE_BADGE_COUNT,
        automationId: 'newMessageBadgeCount',
        weight: 100,
        type: SETTING_ITEM_TYPE.TOGGLE,
        ...buildTitleAndDesc(
          'notificationAndSounds',
          'otherNotificationSettings',
          'newMessageBadgeCount',
        ),
      },
    );
  }

  dispose() {
    this._settingService.unRegisterAll(MESSAGE_SETTING_SCOPE);
  }
}

export { MessageSettingManager };
