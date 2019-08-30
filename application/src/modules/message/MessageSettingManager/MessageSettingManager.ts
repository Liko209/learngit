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
import { SETTING_SECTION } from '@/modules/notification/notificationSettingManager/constant';
import {
  MESSAGE_SETTING_SCOPE,
  MESSAGE_SETTING_ITEM,
} from '../interface/constant';
import { IMessageSettingManager } from '../interface';
import {
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  NEW_MESSAGE_BADGES_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  AUDIO_SOUNDS_INFO,
} from 'sdk/module/profile';
import { NewMessageSelectSourceItem } from './NewMessageSelectSourceItem.View';
import { buildTitleAndDesc } from '@/modules/setting/utils';
import { BadgeCountSourceItem } from './NewMessageBadgeCountSelectSourceItem.View';
import { EmailNotificationTimeSourceItem } from './EmailNotificationTimeSelectSourceItem.View';
import { SETTING_SECTION__SOUNDS } from '@/modules/setting/constant';
import {
  SoundSourceItem,
  SoundSourcePlayerRenderer,
} from '@/modules/setting/container/SettingItem/Select/SoundSourceItem.View';
import {
  SoundSelectDataTrackingOption,
  BadgeCountSelectDataTrackingOption,
  EmailNotificationSelectDataTrackingOption,
} from './dataTrackingTransformer';
import { SETTING_PAGE__MESSAGES } from '@/modules/setting/manager/placeholder/constant';
import { MESSAGE_SETTING_SECTION } from './constant';

const NewMessageSelectDataTrackingOption: {
  [key in DESKTOP_MESSAGE_NOTIFICATION_OPTIONS]: string
} = {
  always: 'All new messages',
  mentions_or_dms: 'Direct messages and mentions',
  never: 'Off',
};

class MessageSettingManager implements IMessageSettingManager {
  @ISettingService private _settingService: ISettingService;

  async init() {
    this.registerMessageSettingPage();
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION.DESKTOP_NOTIFICATIONS,
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_NEW_MESSAGES,
        automationId: 'newMessages',
        title:
          'setting.notificationAndSounds.desktopNotifications.newMessages.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.newMessages.description',
        type: SETTING_ITEM_TYPE.SELECT,
        sourceRenderer: NewMessageSelectSourceItem,
        dataTracking: {
          name: 'newMessage',
          type: 'desktopNotificationSettings',
          optionTransform: value => NewMessageSelectDataTrackingOption[value],
        },
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
        sourceRenderer: EmailNotificationTimeSourceItem,
        dataTracking: {
          name: 'emailDirectMessage',
          type: 'emailNotificationSettings',
          optionTransform: value =>
            EmailNotificationSelectDataTrackingOption[value],
        },
        ...emailNotificationTitleAndDescBuilder('directMessages'),
      } as SelectSettingItem<EMAIL_NOTIFICATION_OPTIONS>,
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_MENTIONS,
        automationId: 'notificationMentions',
        weight: 200,
        type: SETTING_ITEM_TYPE.TOGGLE,
        dataTracking: {
          name: 'emailMentions',
          type: 'emailNotificationSettings',
        },
        ...emailNotificationTitleAndDescBuilder('mentions'),
      },
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_TEAMS,
        automationId: 'notificationTeams',
        type: SETTING_ITEM_TYPE.SELECT,
        weight: 300,
        sourceRenderer: EmailNotificationTimeSourceItem,
        dataTracking: {
          name: 'emailTeams',
          type: 'emailNotificationSettings',
          optionTransform: value =>
            EmailNotificationSelectDataTrackingOption[value],
        },
        ...emailNotificationTitleAndDescBuilder('teams'),
      } as SelectSettingItem<EMAIL_NOTIFICATION_OPTIONS>,
      {
        id: MESSAGE_SETTING_ITEM.NOTIFICATION_DAILY_DIGEST,
        automationId: 'notificationDailyDigest',
        weight: 400,
        type: SETTING_ITEM_TYPE.TOGGLE,
        dataTracking: {
          name: 'emailDailyDigest',
          type: 'emailNotificationSettings',
        },
        ...emailNotificationTitleAndDescBuilder('dailyDigest'),
      },
    ];

    emailNotificationSettingItems.forEach(i =>
      this._settingService.registerItem(
        MESSAGE_SETTING_SCOPE,
        SETTING_SECTION.EMAIL_NOTIFICATIONS,
        i,
      ),
    );

    this.registerSounds();
  }
  registerConversationListSection() {
    const titleBodyBuilder = buildTitleAndDesc('Messages', 'conversationList');
    this._settingService.registerSection(
      MESSAGE_SETTING_SCOPE,
      SETTING_PAGE__MESSAGES,
      {
        id: MESSAGE_SETTING_SECTION.CONVERSATION_LIST,
        title: 'setting.Messages.conversationList.title',
        weight: 100,
        automationId: 'conversationList',
        items: [
          {
            id: MESSAGE_SETTING_ITEM.MAX_CONVERSATIONS,
            automationId: 'maxConversations',
            ...titleBodyBuilder('maxConversations'),
            type: SETTING_ITEM_TYPE.SELECT,
            dataTracking: {
              name: 'maxConversations',
              type: 'messages',
            },
            weight: 100,
          },
          {
            id: MESSAGE_SETTING_ITEM.NEW_MESSAGE_BADGE_COUNT,
            automationId: 'newMessageBadgeCount',
            weight: 200,
            type: SETTING_ITEM_TYPE.SELECT,
            dataTracking: {
              name: 'newMessageBadgeCount',
              type: 'messages',
              optionTransform: value =>
                BadgeCountSelectDataTrackingOption[value],
            },
            sourceRenderer: BadgeCountSourceItem,
            ...titleBodyBuilder('newMessageBadgeCount'),
          } as SelectSettingItem<NEW_MESSAGE_BADGES_OPTIONS>,
        ],
      },
    );
  }
  registerMessageThreadSection() {
    const titleBodyBuilder = buildTitleAndDesc('Messages', 'messageThread');

    this._settingService.registerSection(
      MESSAGE_SETTING_SCOPE,
      SETTING_PAGE__MESSAGES,
      {
        id: MESSAGE_SETTING_SECTION.MESSAGE_THREAD,
        title: 'setting.Messages.messageThread.title',
        weight: 200,
        automationId: 'messageThread',
        items: [
          {
            id: MESSAGE_SETTING_ITEM.SHOW_LINK_PREVIEWS,
            automationId: 'showLinkPreviews',
            ...titleBodyBuilder('linkPreviews'),
            type: SETTING_ITEM_TYPE.TOGGLE,
            dataTracking: {
              name: 'linkPreview',
              type: 'messages',
            },
            weight: 100,
          },
        ],
      },
    );
  }

  registerMessageSettingPage() {
    this.registerConversationListSection();
    this.registerMessageThreadSection();
  }
  registerSounds() {
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION__SOUNDS,
      {
        id: MESSAGE_SETTING_ITEM.SOUND_DIRECT_MESSAGES,
        automationId: 'soundDirectMessages',
        weight: 100,
        type: SETTING_ITEM_TYPE.SELECT,
        sourceRenderer: SoundSourceItem,
        secondaryActionRenderer: SoundSourcePlayerRenderer,
        ...buildTitleAndDesc(
          'notificationAndSounds',
          'sounds',
          'directMessages',
        ),
        dataTracking: {
          name: 'directMessages',
          type: 'soundSettings',
          optionTransform: ({ id }) => SoundSelectDataTrackingOption[id],
        },
      } as SelectSettingItem<AUDIO_SOUNDS_INFO>,
    );
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION__SOUNDS,
      {
        id: MESSAGE_SETTING_ITEM.SOUND_MENTIONS,
        automationId: 'soundMentions',
        weight: 200,
        type: SETTING_ITEM_TYPE.SELECT,
        sourceRenderer: SoundSourceItem,
        secondaryActionRenderer: SoundSourcePlayerRenderer,
        ...buildTitleAndDesc('notificationAndSounds', 'sounds', 'mentions'),
        dataTracking: {
          name: 'mentions',
          type: 'soundSettings',
          optionTransform: ({ id }) => SoundSelectDataTrackingOption[id],
        },
      } as SelectSettingItem<AUDIO_SOUNDS_INFO>,
    );
    this._settingService.registerItem(
      MESSAGE_SETTING_SCOPE,
      SETTING_SECTION__SOUNDS,
      {
        id: MESSAGE_SETTING_ITEM.SOUND_TEAM_MESSAGES,
        automationId: 'soundTeamMessages',
        weight: 300,
        type: SETTING_ITEM_TYPE.SELECT,
        sourceRenderer: SoundSourceItem,
        secondaryActionRenderer: SoundSourcePlayerRenderer,
        ...buildTitleAndDesc('notificationAndSounds', 'sounds', 'teamMessages'),
        dataTracking: {
          name: 'teamMessages',
          type: 'soundSettings',
          optionTransform: ({ id }) => SoundSelectDataTrackingOption[id],
        },
      } as SelectSettingItem<AUDIO_SOUNDS_INFO>,
    );
  }
  dispose() {
    this._settingService.unRegisterAll(MESSAGE_SETTING_SCOPE);
  }
}

export { MessageSettingManager };
