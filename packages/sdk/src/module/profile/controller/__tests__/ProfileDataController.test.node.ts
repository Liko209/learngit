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
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from '../../constants';
import { SettingService } from 'sdk/module/setting';
import GroupService from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../../../api/glip/profile');
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
  beforeEach(() => {
    mockEntitySourceController = new MockEntitySourceController();
    mockEntityCacheController = buildEntityCacheController();
    profileDataController = new ProfileDataController(
      mockEntitySourceController,
      mockEntityCacheController,
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

  describe('_getGlobalSetting()', () => {
    it.each`
      global_setting                                         | isTeam   | expectRes
      ${DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF}            | ${true}  | ${true}
      ${DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE}    | ${true}  | ${false}
      ${DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION} | ${true}  | ${true}
      ${DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF}            | ${false} | ${true}
      ${DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE}    | ${false} | ${false}
      ${DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION} | ${false} | ${false}
      ${undefined}                                           | ${false} | ${false}
      ${undefined}                                           | ${true}  | ${true}
    `(
      'should return $expectRes when global setting is $global_setting and isTeam is $isTeam',
      async ({ global_setting, isTeam, expectRes }) => {
        const groupId = 1;
        groupService.getById = jest.fn().mockReturnValue({ is_team: isTeam });
        settingService.getById = jest
          .fn()
          .mockReturnValue({ value: global_setting });
        const result = await profileDataController['_getGlobalSetting'](
          groupId,
        );
        expect(result).toEqual(expectRes);
      },
    );
  });

  describe('isNotificationMute()', () => {
    it.each`
      muted        | desktop_notifications | global_setting | expectRes
      ${undefined} | ${true}               | ${true}        | ${false}
      ${undefined} | ${true}               | ${false}       | ${false}
      ${undefined} | ${false}              | ${true}        | ${true}
      ${undefined} | ${false}              | ${false}       | ${true}
      ${undefined} | ${undefined}          | ${true}        | ${true}
      ${undefined} | ${undefined}          | ${false}       | ${false}
      ${false}     | ${true}               | ${true}        | ${false}
      ${false}     | ${true}               | ${false}       | ${false}
      ${false}     | ${false}              | ${true}        | ${true}
      ${false}     | ${false}              | ${false}       | ${true}
      ${false}     | ${undefined}          | ${true}        | ${true}
      ${false}     | ${undefined}          | ${false}       | ${false}
      ${true}      | ${true}               | ${true}        | ${true}
      ${true}      | ${true}               | ${false}       | ${true}
      ${true}      | ${false}              | ${true}        | ${true}
      ${true}      | ${false}              | ${false}       | ${true}
      ${true}      | ${undefined}          | ${true}        | ${true}
      ${true}      | ${undefined}          | ${false}       | ${true}
    `(
      'should return $expectRes when mute is $mute and desktop_notification is $desktop_notifications and global_setting is $global_setting',
      async ({ muted, desktop_notifications, global_setting, expectRes }) => {
        const groupId = 1;
        profileDataController['_getGlobalSetting'] = jest
          .fn()
          .mockReturnValue(global_setting);
        profileDataController.getProfile = jest.fn().mockReturnValue({
          conversation_level_notifications: {
            [groupId]: {
              muted,
              desktop_notifications,
            },
          },
        });
        const result = await profileDataController.isNotificationMute(groupId);
        expect(result).toEqual(expectRes);
      },
    );
    it('should return global setting when profile.conversation_level_notifications is undefined', async () => {
      const groupId = 1;
      profileDataController['_getGlobalSetting'] = jest
        .fn()
        .mockReturnValue(true);
      profileDataController.getProfile = jest.fn().mockReturnValue({
        conversation_level_notifications: undefined,
      });
      const result = await profileDataController.isNotificationMute(groupId);
      expect(result).toEqual(true);
    });
  });
});
