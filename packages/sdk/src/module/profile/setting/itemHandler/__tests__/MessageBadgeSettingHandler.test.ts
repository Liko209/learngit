/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { MessageBadgeSettingHandler } from '../MessageBadgeSettingHandler';
import { UserSettingEntity, SettingEntityIds } from 'sdk/module/setting';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { ProfileService } from 'sdk/module/profile';
import {
  NEW_MESSAGE_BADGES_OPTIONS,
  SETTING_KEYS,
} from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('MessageBadgeSettingHandler', () => {
  let profileService: ProfileService;
  let accountService: AccountService;
  let messageBadgeSettingHandler: MessageBadgeSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      weight: 1,
      parentModelId: 1,
      valueType: 1,
      id: SettingEntityIds.Notification_NewMessageBadgeCount,
      source: [
        NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS,
        NEW_MESSAGE_BADGES_OPTIONS.ALL,
      ],
      value: NEW_MESSAGE_BADGES_OPTIONS.ALL,
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
    messageBadgeSettingHandler = new MessageBadgeSettingHandler(profileService);
    messageBadgeSettingHandler.notifyUserSettingEntityUpdate = jest.fn();
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
        [SETTING_KEYS.NEW_MESSAGE_BADGES]: NEW_MESSAGE_BADGES_OPTIONS.ALL,
      });
      const result = await messageBadgeSettingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await messageBadgeSettingHandler.updateValue(
        NEW_MESSAGE_BADGES_OPTIONS.ALL,
      );
      expect(profileService.updateSettingOptions).toBeCalledWith([
        {
          value: NEW_MESSAGE_BADGES_OPTIONS.ALL,
          key: SETTING_KEYS.NEW_MESSAGE_BADGES,
        },
      ]);
    });
  });
});
