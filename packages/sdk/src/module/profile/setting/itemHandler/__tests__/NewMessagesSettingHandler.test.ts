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
} from 'sdk/module/setting';
jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NewMessagesSettingHandler', () => {
  let profileService: ProfileService;
  let newMessagesSettingHandler: NewMessagesSettingHandler;
  let accoutService: AccountService;
  let settingService: SettingService;
  let mockDefaultSettingItem: UserSettingEntity;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      parentModelId: 1,
      valueType: 1,
      weight: 1,
      id: SettingEntityIds.Notification_NewMessages,
      state: 0,
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
    profileService.updateSettingOptions = jest.fn();
    newMessagesSettingHandler = new NewMessagesSettingHandler(
      profileService,
      accoutService,
      settingService,
    );
    newMessagesSettingHandler.notifyUserSettingEntityUpdate = jest.fn();
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
        const result = await newMessagesSettingHandler.fetchUserSettingEntity();
        expect(result).toEqual(mockDefaultSettingItem);
      },
    );
  });
  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await newMessagesSettingHandler.updateValue(
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
});
