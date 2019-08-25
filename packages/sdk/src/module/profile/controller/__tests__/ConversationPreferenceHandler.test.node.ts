/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-08-23 16:03:37
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import { ConversationPreferenceHandler } from '../ConversationPreferenceHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import GroupService from 'sdk/module/group';
import {
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  SoundsListWithDefault,
  EMAIL_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SOUNDS_TYPE,
} from '../..';

jest.mock('sdk/module/group');
jest.mock('sdk/module/setting');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
describe('ConversationPreferenceHandler', () => {
  let conversationPreferenceHandler: ConversationPreferenceHandler;
  let settingService: SettingService;
  let groupService: GroupService;

  beforeEach(() => {
    conversationPreferenceHandler = new ConversationPreferenceHandler();
    settingService = new SettingService();
    groupService = new GroupService();
    ServiceLoader.getInstance = jest.fn().mockImplementation(config => {
      if (config === ServiceConfig.SETTING_SERVICE) {
        return settingService;
      }
      if (config === ServiceConfig.GROUP_SERVICE) {
        return groupService;
      }
    });
  });
  afterEach(() => {
    clearMocks();
  });

  describe('buildEntityInfo', () => {
    const groupId = 1;
    const desktopNotifications = true;
    const emailNotifications = EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE;
    const globalEmail = EMAIL_NOTIFICATION_OPTIONS.OFF;
    const globalMobile = MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF;
    const globalSound = SoundsListWithDefault[1];
    const globalDesktop = DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION;
    const expectValue = {
      id: groupId,
      muted: false,
      desktop_notifications: false,
      email_notifications: globalEmail,
      audio_notifications: globalSound,
      push_notifications: globalMobile,
    };
    beforeEach(() => {
      settingService.getById = jest.fn().mockImplementation(id => {
        if (id === SettingEntityIds.Notification_NewMessages) {
          return { value: globalDesktop };
        }
        if (id === SettingEntityIds.Audio_TeamMessages) {
          return { value: globalSound };
        }
        if (id === SettingEntityIds.Notification_Teams) {
          return { value: globalEmail };
        }
        if (id === SettingEntityIds.MOBILE_Team) {
          return { value: globalMobile };
        }
        if (id === SettingEntityIds.Audio_DirectMessage) {
          return { value: globalSound };
        }
        if (id === SettingEntityIds.Notification_DirectMessages) {
          return { value: globalEmail };
        }
        if (id === SettingEntityIds.MOBILE_DM) {
          return { value: globalMobile };
        }
      });
      groupService.getById = jest.fn().mockResolvedValue({ is_team: false });
    });
    it('should return globalValue when conversation is team and conversation preference is undefined', async () => {
      groupService.getById = jest.fn().mockReturnValue({ is_team: true });
      const profile = {
        conversation_level_notifications: {
          [groupId]: undefined,
        },
      };
      const result = await conversationPreferenceHandler.buildEntityInfo(
        profile,
        groupId,
      );
      expect(result).toEqual(expectValue);
    });
    it('should return globalValue when conversation is direct message and conversation preference is undefined', async () => {
      groupService.getById = jest.fn().mockResolvedValue({ is_team: false });
      const profile = {
        conversation_level_notifications: {
          [groupId]: undefined,
        },
      };
      const result = await conversationPreferenceHandler.buildEntityInfo(
        profile,
        groupId,
      );
      expect(result).toEqual({
        ...expectValue,
        desktop_notifications: true,
      });
    });
    it('should return value when conversation preference is not undefined', async () => {
      groupService.getById = jest.fn().mockReturnValue({ is_team: false });
      const profile = {
        conversation_level_notifications: {
          [groupId]: {
            desktop_notifications: desktopNotifications,
            email_notifications: emailNotifications,
          },
        },
      };
      const result = await conversationPreferenceHandler.buildEntityInfo(
        profile,
        groupId,
      );
      expect(result).toEqual({
        ...expectValue,
        desktop_notifications: desktopNotifications,
        email_notifications: emailNotifications,
      });
    });
    it.each`
      sound                       | isTeam   | expectRes
      ${undefined}                | ${true}  | ${globalSound}
      ${undefined}                | ${false} | ${globalSound}
      ${SOUNDS_TYPE.Default}      | ${true}  | ${globalSound}
      ${SOUNDS_TYPE.Default}      | ${false} | ${globalSound}
      ${SOUNDS_TYPE.Double_Beeps} | ${false} | ${SoundsListWithDefault[1]}
    `(
      'should return $expectRes when isTeam is $isTeam and backend is $sound',
      async ({ sound, isTeam, expectRes }) => {
        groupService.getById = jest.fn().mockReturnValue({ is_team: isTeam });
        const profile = {
          conversation_level_notifications: {
            [groupId]: {
              audio_notifications: sound,
            },
          },
        };
        const result = await conversationPreferenceHandler.buildEntityInfo(
          profile,
          groupId,
        );
        expect(result.audio_notifications).toEqual(expectRes);
      },
    );
    it.each`
      desktop      | isTeam   | expectRes
      ${undefined} | ${true}  | ${false}
      ${undefined} | ${false} | ${true}
      ${true}      | ${false} | ${true}
    `(
      'should return desktop_notification is $expectRes when isTeam is $isTeam and backend is $desktop',
      async ({ desktop, isTeam, expectRes }) => {
        const groupId = 1;
        groupService.getById = jest.fn().mockReturnValue({ is_team: isTeam });
        const profile = {
          conversation_level_notifications: {
            [groupId]: {
              desktop_notifications: desktop,
            },
          },
        };
        const result = await conversationPreferenceHandler.buildEntityInfo(
          profile,
          groupId,
        );
        expect(result.desktop_notifications).toEqual(expectRes);
      },
    );
  });
});
