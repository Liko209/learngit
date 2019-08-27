/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { ProfileSubscribeEntityHandler } from '../ProfileSubscribeEntityHandler';
import { UserSettingEntity, SettingEntityIds } from 'sdk/module/setting';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { ProfileService } from 'sdk/module/profile';
import {
  SETTING_KEYS,
  EMAIL_NOTIFICATION_OPTIONS,
} from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { Profile } from '../../../entity';

jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ProfileSubscribeEntityHandler', () => {
  let profileService: ProfileService;
  let accountService: AccountService;
  let settingHandler: ProfileSubscribeEntityHandler<EMAIL_NOTIFICATION_OPTIONS>;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      id: SettingEntityIds.Notification_Teams,
      source: [
        EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
        EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
        EMAIL_NOTIFICATION_OPTIONS.OFF,
      ],
      value: EMAIL_NOTIFICATION_OPTIONS.OFF,
      state: 0,
      valueSetter: expect.any(Function),
    };

    profileService = new ProfileService();
    accountService = {
      userConfig: {
        getCurrentUserProfileId: jest.fn().mockReturnValue(mockUserId),
      },
    } as any;
    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.ACCOUNT_SERVICE) {
        return accountService;
      }
      if (key === ServiceConfig.PROFILE_SERVICE) {
        return profileService;
      }
    });
    profileService.updateSettingOptions = jest.fn();
    settingHandler = new ProfileSubscribeEntityHandler<
      EMAIL_NOTIFICATION_OPTIONS
    >(profileService, {
      id: SettingEntityIds.Notification_Teams,
      setting_key: SETTING_KEYS.EMAIL_TEAM,
      source: [
        EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
        EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
        EMAIL_NOTIFICATION_OPTIONS.OFF,
      ],
    });
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('constructor()', () => {
    it('should subscribe notification when create self', () => {
      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.PROFILE,
        expect.any(Function),
      );
    });
  });

  describe('fetchUserSettingEntity()', () => {
    it('should get new messages setting value ', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.EMAIL_TEAM]: EMAIL_NOTIFICATION_OPTIONS.OFF,
      });
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(EMAIL_NOTIFICATION_OPTIONS.OFF);
      expect(profileService.updateSettingOptions).toHaveBeenCalledWith([
        {
          value: EMAIL_NOTIFICATION_OPTIONS.OFF,
          key: SETTING_KEYS.EMAIL_TEAM,
        },
      ]);
    });
  });

  describe('handleProfileUpdated', () => {
    it('should emit update when has subscribe update', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          [SETTING_KEYS.EMAIL_TEAM]: EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toHaveBeenCalled();
        done();
      });
    });

    it('should not emit update when no change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          [SETTING_KEYS.EMAIL_TEAM]: EMAIL_NOTIFICATION_OPTIONS.OFF,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
