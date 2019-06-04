/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY, notificationCenter } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import {
  ProfileService,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
} from 'sdk/module/profile';
import { NewMessagesSettingHandler } from '../NewMessagesSettingHandler';
import {
  SettingService,
  UserSettingEntity,
  SettingEntityIds,
  SettingService,
} from '../../../../setting';
import {
  SETTING_KEYS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  CALLING_OPTIONS,
} from '../../../constants';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { Profile } from 'sdk/module/profile/entity';
jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NewMessagesSettingHandler', () => {
  let profileService: ProfileService;
  let settingHandler: NewMessagesSettingHandler;
  let accoutService: AccountService;
  let settingService: SettingService;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      parentModelId: 1,
      valueType: 1,
      weight: 1,
      id: SettingEntityIds.Notification_NewMessages,
      state: 1,
      source: [
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION,
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
      ],
      value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
      valueSetter: expect.any(Function),
    };
    profileService = new ProfileService();
    settingService = new SettingService();
    accoutService = new AccountService(null);
    accoutService = {
      userConfig: {
        getCurrentUserProfileId: jest.fn().mockReturnValue(mockUserId),
      },
    } as any;
    profileService.getProfile = jest.fn().mockReturnValue({
      [SETTING_KEYS.DESKTOP_MESSAGE]: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
      [SETTING_KEYS.CALL_OPTION]: CALLING_OPTIONS.RINGCENTRAL,
    });
    profileService.updateSettingOptions = jest.fn();
    settingHandler = new NewMessagesSettingHandler(
      profileService,
      accoutService,
      settingService,
    );
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('constructor', () => {
    it('should subscribe notification when create self', () => {
      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.PROFILE,
        expect.any(Function),
      );
    });
  });

  describe('fetchUserSettingEntity()', () => {
    it.each`
      isElectron | desktopNotifications | expectRes
      ${true}    | ${true}              | ${0}
      ${true}    | ${false}             | ${0}
      ${false}   | ${true}              | ${0}
      ${false}   | ${false}             | ${1}
    `(
      'should get state is $expectRes when desktopNotifications is $desktopNotifications and isElectron is $isElectron',
      async ({ isElectron, desktopNotifications, expectRes }) => {
        PlatformUtils.isElectron = jest.fn().mockReturnValue(isElectron);
        profileService.getProfile = jest.fn().mockReturnValue({
          [SETTING_KEYS.DESKTOP_MESSAGE]:
            DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
        });
        settingService.getById = jest
          .fn()
          .mockReturnValue({ value: { desktopNotifications } });
        mockDefaultSettingItem.state = expectRes;
        const result = await settingHandler.fetchUserSettingEntity();
        expect(result).toEqual(mockDefaultSettingItem);
      },
    );

    it('should get value is DM_AND_MENTION when new message is undefined', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_MESSAGE]: undefined,
      });
      mockDefaultSettingItem.value =
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION;
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
    it('should get value is off when new message is off', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_MESSAGE]:
          DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
      });
      mockDefaultSettingItem.value = DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF;
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
  });
  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
      );
      expect(profileService.updateSettingOptions).toBeCalledWith([
        {
          value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
          key: SETTING_KEYS.DESKTOP_MESSAGE,
        },
      ]);
    });
  });
  describe('handleProfileUpdated', () => {
    it('should emit update when has subscribe update and DESKTOP_MESSAGE change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          [SETTING_KEYS.DESKTOP_MESSAGE]:
            DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });

    it('should not emit update when no change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          [SETTING_KEYS.DESKTOP_MESSAGE]:
            DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });
  });
  describe('handleSettingModelUpdated', () => {
    it('should emit update when has subscribe update and Notification_Browser change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      notificationCenter.emitEntityUpdate<UserSettingEntity>(
        ENTITY.USER_SETTING,
        [
          {
            id: SettingEntityIds.Notification_Browser,
            value: true,
          } as UserSettingEntity,
        ],
      );
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });
    it('should emit update when has subscribe update and Phone_DefaultApp change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      notificationCenter.emitEntityUpdate<UserSettingEntity>(
        ENTITY.USER_SETTING,
        [
          {
            id: SettingEntityIds.Phone_DefaultApp,
            value: true,
          } as UserSettingEntity,
        ],
      );
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });

    it('should not emit update when no change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      notificationCenter.emitEntityUpdate<UserSettingEntity>(
        ENTITY.USER_SETTING,
        [],
      );
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });
  });
});
