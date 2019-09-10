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
import { SettingService } from 'sdk/module/setting';
import GroupService from 'sdk/module/group';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ProfileEntityObservable } from '../ProfileEntityObservable';
import { ConversationPreferenceHandler } from '../ConversationPreferenceHandler';

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
      muted    | desktopNotifications | expectRes
      ${true}  | ${true}              | ${true}
      ${true}  | ${false}             | ${true}
      ${false} | ${true}              | ${false}
      ${false} | ${false}             | ${true}
    `(
      'should return $expectRes when mute is $mute and desktop_notifications is $desktop_notifications',
      async ({ muted, desktopNotifications, expectRes }) => {
        const groupId = 1;
        profileDataController.getConversationPreference = jest
          .fn()
          .mockResolvedValue({
            muted,
            desktopNotifications,
          });
        const result = await profileDataController.isNotificationMute(groupId);
        expect(result).toEqual(expectRes);
      },
    );
  });
  describe('getConversationPreference', () => {
    it('should call buildEntity', async () => {
      profileDataController.getProfile = jest.fn();
      profileDataController[
        '_conversationPreferenceHandler'
      ].buildEntityInfo = jest.fn().mockResolvedValue(1);
      const result = await profileDataController.getConversationPreference(1);
      expect(result).toEqual(1);
    });
  });
});
