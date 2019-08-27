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
import { notificationCenter } from 'sdk/service';

jest.mock('sdk/module/group');
jest.mock('sdk/module/setting');
jest.mock('sdk/service');

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
    conversationPreferenceHandler = new ConversationPreferenceHandler([]);
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
      desktopNotifications: false,
      emailNotifications: globalEmail,
      audioNotifications: globalSound,
      pushNotifications: globalMobile,
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
    it('should return globalValue when conversation is team and conversation preference is undefined [JPT-2807,JPT-2810,JPT-2811]', async () => {
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
    it('should return globalValue when conversation is direct message and conversation preference is undefined [JPT-2803,JPT-2810,JPT-2811]', async () => {
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
        desktopNotifications: true,
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
        desktopNotifications,
        emailNotifications,
      });
    });
    it.each`
      desktop      | isTeam   | expectRes
      ${undefined} | ${true}  | ${false}
      ${undefined} | ${false} | ${true}
      ${true}      | ${false} | ${true}
    `(
      'should return desktopNotification is $expectRes when isTeam is $isTeam and backend is $desktop',
      async ({ desktop, isTeam, expectRes }) => {
        const groupId = 1;
        groupService.getById = jest.fn().mockReturnValue({ is_team: isTeam });
        const profile = {
          conversation_level_notifications: {
            [groupId]: {
              desktopNotifications: desktop,
            },
          },
        };
        const result = await conversationPreferenceHandler.buildEntityInfo(
          profile,
          groupId,
        );
        expect(result.desktopNotifications).toEqual(expectRes);
      },
    );
  });

  describe('update', () => {
    const notification = {
      muted: true,
      desktop_notifications: true,
      push_notifications: MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF,
      email_notifications: EMAIL_NOTIFICATION_OPTIONS.OFF,
    };
    const audio = {
      gid: 2,
      sound: SOUNDS_TYPE.Alert,
    };
    const profile: any = {
      conversation_level_notifications: {
        1: notification,
      },
      team_specific_audio_notifications: [audio],
    };
    beforeEach(() => {
      conversationPreferenceHandler.buildEntityInfo = jest.fn();
    });
    it('should not call emit when new profile has no conversation preference', async () => {
      const newProfile: any = {};
      const localProfile = {
        ...profile,
      };
      await conversationPreferenceHandler.update(newProfile, localProfile);
      expect(
        conversationPreferenceHandler.buildEntityInfo,
      ).not.toHaveBeenCalled();
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
    });
    it('should update all conversation when local profile is null', async () => {
      const newProfile = {
        ...profile,
      };
      const localProfile = null;
      await conversationPreferenceHandler.update(newProfile, localProfile);
      expect(
        conversationPreferenceHandler.buildEntityInfo,
      ).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    });
    it('should update different conversation when notification change', async () => {
      const newProfile = {
        ...profile,
        conversation_level_notifications: {
          1: notification,
          4: notification,
          3: notification,
        },
      };
      const localProfile = {
        ...profile,
      };
      await conversationPreferenceHandler.update(newProfile, localProfile);
      expect(
        conversationPreferenceHandler.buildEntityInfo,
      ).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    });
    it('should update all conversation when sound change', async () => {
      const newProfile = {
        ...profile,
        team_specific_audio_notifications: [
          { gid: 2, sound: SOUNDS_TYPE.Default },
          { gid: 3, sound: SOUNDS_TYPE.Alert },
          { gid: 4, sound: SOUNDS_TYPE.Alert },
        ],
      };
      const localProfile = {
        ...profile,
        team_specific_audio_notifications: [
          { gid: 2, sound: SOUNDS_TYPE.Alert },
          { gid: 1, sound: SOUNDS_TYPE.Alert },
        ],
      };
      await conversationPreferenceHandler.update(newProfile, localProfile);
      expect(
        conversationPreferenceHandler.buildEntityInfo,
      ).toHaveBeenCalledTimes(4);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    });
  });
});
