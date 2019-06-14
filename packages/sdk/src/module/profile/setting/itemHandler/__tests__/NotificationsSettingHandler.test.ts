/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import { Pal, PERMISSION } from 'sdk/pal';
import { ENTITY, APPLICATION, notificationCenter } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { ProfileService, SETTING_KEYS } from 'sdk/module/profile';
import { NotificationsSettingHandler } from '../NotificationsSettingHandler';
import { UserSettingEntity, SettingEntityIds } from 'sdk/module/setting';
jest.mock('sdk/utils/PlatformUtils');
jest.mock('sdk/module/profile');
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NotificationsSettingHandler ', () => {
  let profileService: ProfileService;
  let notificationsSettingHandler: NotificationsSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  let accountService: AccountService;
  const mockUserId = 123;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      id: SettingEntityIds.Notification_Browser,
      parentModelId: 1,
      valueType: 1,
      weight: 1,
      state: 0,
      value: {
        wantNotifications: true,
        browserPermission: PERMISSION.GRANTED,
        desktopNotifications: true,
      },
      valueSetter: expect.any(Function),
    };
    profileService = new ProfileService();
    accountService = {
      userConfig: {
        getCurrentUserProfileId: jest.fn().mockReturnValue(mockUserId),
      },
    } as any;
    PlatformUtils.isElectron = jest.fn().mockReturnValue(false);
    profileService.updateSettingOptions = jest.fn();
    notificationsSettingHandler = new NotificationsSettingHandler(
      profileService,
      accountService,
    );

    notificationsSettingHandler.notifyUserSettingEntityUpdate = jest.fn();
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
      expect(notificationCenter.on).toHaveBeenCalledWith(
        APPLICATION.NOTIFICATION_PERMISSION_CHANGE,
        expect.any(Function),
      );
    });
  });

  describe('fetchUserSettingEntity()', () => {
    beforeEach(() => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_NOTIFICATION]: true,
      });
      Pal.instance.getNotificationPermission = jest.fn().mockReturnValue({
        current: PERMISSION.GRANTED,
        isGranted: true,
      });
    });
    it.each`
      wantNotifications | browserPermission     | expectRes
      ${true}           | ${PERMISSION.GRANTED} | ${true}
      ${true}           | ${PERMISSION.DEFAULT} | ${false}
      ${true}           | ${PERMISSION.DENIED}  | ${false}
      ${false}          | ${PERMISSION.GRANTED} | ${false}
      ${false}          | ${PERMISSION.DEFAULT} | ${false}
      ${false}          | ${PERMISSION.DENIED}  | ${false}
      ${undefined}      | ${PERMISSION.GRANTED} | ${true}
      ${undefined}      | ${PERMISSION.DEFAULT} | ${false}
      ${undefined}      | ${PERMISSION.DENIED}  | ${false}
    `(
      'should get desktopNotification is $expectRes when browserPermission is $browserPermission and wantNotifications is $wantNotifications',
      async ({ wantNotifications, browserPermission, expectRes }) => {
        profileService.getProfile = jest.fn().mockReturnValue({
          [SETTING_KEYS.DESKTOP_NOTIFICATION]: wantNotifications,
        });
        Pal.instance.getNotificationPermission = jest.fn().mockReturnValue({
          current: browserPermission,
          isGranted: browserPermission === PERMISSION.GRANTED,
        });
        mockDefaultSettingItem.value = {
          wantNotifications:
            wantNotifications === undefined ? true : wantNotifications,
          browserPermission: browserPermission,
          desktopNotifications: expectRes,
        };
        const result = await notificationsSettingHandler.fetchUserSettingEntity();
        expect(result).toEqual(mockDefaultSettingItem);
      },
    );

    it('should get state 2 when it is electron', async () => {
      PlatformUtils.isElectron = jest.fn().mockReturnValue(true);
      mockDefaultSettingItem.state = 2;
      const result = await notificationsSettingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions when browserPermission is granted and wantNotifications is not same to desktopNotifications', async () => {
      Pal.instance.getNotificationPermission = jest.fn().mockReturnValue({
        isGranted: true,
      });
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_NOTIFICATION]: false,
      });
      await notificationsSettingHandler.updateValue({
        browserPermission: PERMISSION.GRANTED,
        wantNotifications: true,
        desktopNotifications: true,
      });
      expect(profileService.updateSettingOptions).toBeCalledWith([
        {
          value: true,
          key: SETTING_KEYS.DESKTOP_NOTIFICATION,
        },
      ]);
    });

    it('should not call updateSettingOptions when browserPermission is granted and wantNotifications is undefined', async () => {
      Pal.instance.getNotificationPermission = jest.fn().mockReturnValue({
        isGranted: true,
      });
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_NOTIFICATION]: true,
      });
      await notificationsSettingHandler.updateValue({
        browserPermission: 'default',
        wantNotifications: true,
        desktopNotifications: undefined,
      });
      expect(profileService.updateSettingOptions).not.toBeCalled();
    });

    it('should not call updateSettingOptions when browserPermission is granted and wantNotifications is same to desktopNotifications', async () => {
      Pal.instance.getNotificationPermission = jest.fn().mockReturnValue({
        isGranted: false,
      });
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_NOTIFICATION]: false,
      });
      await notificationsSettingHandler.updateValue({
        browserPermission: PERMISSION.GRANTED,
        wantNotifications: true,
        desktopNotifications: true,
      });
      expect(profileService.updateSettingOptions).not.toBeCalled();
    });

    it('should not call updateSettingOptions when browserPermission is not granted and wantNotifications is same to desktopNotifications', async () => {
      Pal.instance.getNotificationPermission = jest.fn().mockReturnValue({
        isGranted: false,
      });
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.DESKTOP_NOTIFICATION]: true,
      });
      await notificationsSettingHandler.updateValue({
        browserPermission: 'default',
        wantNotifications: true,
        desktopNotifications: true,
      });
      expect(profileService.updateSettingOptions).not.toBeCalled();
    });
  });
});
