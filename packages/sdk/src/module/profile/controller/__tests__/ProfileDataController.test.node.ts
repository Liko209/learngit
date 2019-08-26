/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-15 09:26:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileDataController } from '../ProfileDataController';
import { Profile } from '../../entity';
import { MockEntitySourceController } from './MockEntitySourceController';
import { buildEntityCacheController } from 'sdk/framework/controller';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import {
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SoundsListWithDefault,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  SOUNDS_TYPE,
} from '../../constants';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import GroupService from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ProfileEntityObservable } from '../ProfileEntityObservable';

jest.mock('../../../../api/glip/profile');
jest.mock('../ProfileEntityObservable');
jest.mock('sdk/framework/controller/interface/IEntitySourceController');
jest.mock('sdk/framework/controller/impl/EntityCacheController');
jest.mock('sdk/module/group');
jest.mock('sdk/module/setting');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ProfileDataController', () => {
  let profileDataController: ProfileDataController;
  let mockEntitySourceController: MockEntitySourceController;
  let mockEntityCacheController: IEntityCacheController<Profile>;
  let settingService: SettingService;
  let groupService: GroupService;
  let mockProfileObservable: ProfileEntityObservable;
  beforeEach(() => {
    mockEntitySourceController = new MockEntitySourceController();
    mockEntityCacheController = buildEntityCacheController();
    mockProfileObservable = new ProfileEntityObservable();
    profileDataController = new ProfileDataController(
      mockEntitySourceController,
      mockEntityCacheController,
      mockProfileObservable,
    );
    settingService = new SettingService();
    groupService = new GroupService();
    ServiceLoader.getInstance = jest.fn().mockImplementation(config => {
      if (config === ServiceConfig.GROUP_SERVICE) {
        return groupService;
      }
      if (config === ServiceConfig.SETTING_SERVICE) {
        return settingService;
      }
    });
  });

  afterEach(() => {
    clearMocks();
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      jest
        .spyOn(profileDataController, 'getCurrentProfileId')
        .mockReturnValue(2);
      jest
        .spyOn(mockEntitySourceController, 'get')
        .mockImplementationOnce(id => id);

      const result = await profileDataController.getProfile();
      expect(result).toEqual(2);
    });
  });

  describe('getLocalProfile()', () => {
    it('should return current user profile', async () => {
      jest
        .spyOn(profileDataController, 'getCurrentProfileId')
        .mockReturnValue(2);
      jest
        .spyOn(mockEntityCacheController, 'get')
        .mockImplementationOnce(id => id);

      const result = await profileDataController.getLocalProfile();
      expect(result).toEqual(2);
    });
    it('should return null when no profile id', async () => {
      jest
        .spyOn(profileDataController, 'getCurrentProfileId')
        .mockReturnValue(undefined);
      jest
        .spyOn(mockEntityCacheController, 'get')
        .mockImplementationOnce(id => id);

      const result = await profileDataController.getLocalProfile();
      expect(result).toEqual(null);
    });
  });

  describe('isConversationHidden()', () => {
    it('should return false because of not profile', async () => {
      profileDataController.getProfile = jest
        .fn()
        .mockImplementationOnce(() => undefined);
      const result = await profileDataController.isConversationHidden(2);
      expect(result).toBeFalsy();
    });

    it('should return 5 because of  hide_group_1 in profile is 5', async () => {
      profileDataController.getProfile = jest
        .fn()
        .mockImplementationOnce(() => ({
          hide_group_1: 5,
        }));
      const result = await profileDataController.isConversationHidden(1);
      expect(result).toBe(5);
    });
  });

  describe('profileHandleData()', () => {
    it('should return null because of not profile', async () => {
      const data = undefined;
      jest
        .spyOn(profileDataController, '_handleProfile')
        .mockImplementationOnce(profile => profile);

      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toBeNull();
    });

    it('should return {id: 2} because of profile is not an array', async () => {
      const data = {
        id: 2,
      };
      jest
        .spyOn(profileDataController, '_handleProfile')
        .mockImplementationOnce(profile => profile);

      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toEqual({ id: 2 });
    });

    it('should return {id: 2} because of profile is an array', async () => {
      const data = [
        {
          id: 2,
        },
      ];
      jest
        .spyOn(profileDataController, '_handleProfile')
        .mockImplementationOnce(profile => profile);

      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toEqual({ id: 2 });
    });

    it('should return null because of new profile modified_at is less than local', async () => {
      const data = {
        id: 2,
        modified_at: 1,
      };
      profileDataController.getLocalProfile = jest.fn().mockReturnValue({
        id: 2,
        modified_at: 10,
      });
      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toEqual({
        id: 2,
        modified_at: 10,
      });
    });
  });

  describe('isNotificationMute()', () => {
    it.each`
      muted    | desktop_notifications | expectRes
      ${true}  | ${true}               | ${true}
      ${true}  | ${false}              | ${true}
      ${false} | ${true}               | ${false}
      ${false} | ${false}              | ${true}
    `(
      'should return $expectRes when mute is $mute and desktop_notifications is $desktop_notifications',
      async ({ muted, desktop_notifications, expectRes }) => {
        const groupId = 1;
        profileDataController.getConversationPreference = jest.fn().mockResolvedValue({
          muted,
          desktop_notifications,
        });
        const result = await profileDataController.isNotificationMute(groupId);
        expect(result).toEqual(expectRes);
      },
    );
  });

  describe(.getConversationPreference', () => {
    const groupId = 1;
    const desktopNotifications = true;
    const soundNotifications = SoundsListWithDefault[2];
    const mobileNotifications =
      MOBILE_TEAM_NOTIFICATION_OPTIONS.FIRST_UNREAD_ONLY;
    const emailNotifications = EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE;
    const muted = true;
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
    });
    it('should return globalValue when conversation is team and conversation preference is undefined', async () => {
      groupService.getById = jest.fn().mockReturnValue({ is_team: true });
      profileDataController.getProfile = jest.fn().mockReturnValue({
        conversation_level_notifications: {
          [groupId]: undefined,
        },
      });
      const result = await profileDataController.getConversationPreference(groupId);
      expect(result).toEqual(expectValue);
    });
    it('should return globalValue when conversation is direct message and conversation preference is undefined', async () => {
      groupService.getById = jest.fn().mockResolvedValue({ is_team: false });
      profileDataController.getProfile = jest.fn().mockReturnValue({
        conversation_level_notifications: {
          [groupId]: undefined,
        },
      });
      const result = await profileDataController.getConversationPreference(groupId);
      expect(result).toEqual({
        ...expectValue,
        desktop_notifications: true,
      });
    });
    it('should return value when conversation preference is not undefined', async () => {
      groupService.getById = jest.fn().mockReturnValue({ is_team: false });
      profileDataController.getProfile = jest.fn().mockReturnValue({
        conversation_level_notifications: {
          [groupId]: {
            desktop_notifications: desktopNotifications,
            email_notifications: emailNotifications,
          },
        },
      });
      const result = await profileDataController.getConversationPreference(groupId);
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
        profileDataController.getProfile = jest.fn().mockReturnValue({
          conversation_level_notifications: {
            [groupId]: {
              audio_notifications: sound,
            },
          },
        });
        const result = await profileDataController.getConversationPreference(groupId);
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
        profileDataController.getProfile = jest.fn().mockReturnValue({
          conversation_level_notifications: {
            [groupId]: {
              desktop_notifications: desktop,
            },
          },
        });
        const result = await profileDataController.getConversationPreference(groupId);
        expect(result.desktop_notifications).toEqual(expectRes);
      },
    );
  });
});
