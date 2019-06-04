/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY, notificationCenter } from 'sdk/service';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import {
  ProfileService,
  NOTIFICATION_OPTIONS,
  SETTING_KEYS,
  CALLING_OPTIONS,
} from 'sdk/module/profile';
import { NewVoicemailsSettingHandler } from '../NewVoicemailsSettingHandler';
import {
  SettingService,
  UserSettingEntity,
  SettingEntityIds,
  SettingService,
} from '../../../../setting';
import { AccountService } from 'sdk/module/account';
import { Profile } from 'sdk/module/profile/entity';
jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NewVoicemailsSettingHandler', () => {
  let profileService: ProfileService;
  let settingHandler: NewVoicemailsSettingHandler;
  let accoutService: AccountService;
  let settingService: SettingService;
  const mockUserId = 123;
  let mockDefaultSettingItem: UserSettingEntity;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      parentModelId: 1,
      valueType: 1,
      weight: 1,
      id: SettingEntityIds.Notification_MissCallAndNewVoiceMails,
      state: 0,
      source: [NOTIFICATION_OPTIONS.OFF, NOTIFICATION_OPTIONS.ON],
      value: NOTIFICATION_OPTIONS.OFF,
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
      [SETTING_KEYS.DESKTOP_VOICEMAIL]: NOTIFICATION_OPTIONS.OFF,
      [SETTING_KEYS.CALL_OPTION]: CALLING_OPTIONS.RINGCENTRAL,
    });
    profileService.updateSettingOptions = jest.fn();
    settingHandler = new NewVoicemailsSettingHandler(
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
      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.USER_SETTING,
        expect.any(Function),
      );
    });
  });

  describe('fetchUserSettingEntity()', () => {
    it.each`
      isElectron | CALL_OPTION                    | desktopNotifications | expectRes
      ${true}    | ${CALLING_OPTIONS.RINGCENTRAL} | ${true}              | ${2}
      ${true}    | ${CALLING_OPTIONS.RINGCENTRAL} | ${false}             | ${2}
      ${true}    | ${CALLING_OPTIONS.GLIP}        | ${true}              | ${0}
      ${true}    | ${CALLING_OPTIONS.GLIP}        | ${false}             | ${0}
      ${false}   | ${CALLING_OPTIONS.RINGCENTRAL} | ${true}              | ${2}
      ${false}   | ${CALLING_OPTIONS.RINGCENTRAL} | ${false}             | ${2}
      ${false}   | ${CALLING_OPTIONS.GLIP}        | ${true}              | ${0}
      ${false}   | ${CALLING_OPTIONS.GLIP}        | ${false}             | ${1}
    `(
      'should get state is $expectRes when browserPermission is $browserPermission and wantNotifications is $wantNotifications',
      async ({ isElectron, CALL_OPTION, desktopNotifications, expectRes }) => {
        PlatformUtils.isElectron = jest.fn().mockReturnValue(isElectron);
        profileService.getProfile = jest.fn().mockReturnValue({
          [SETTING_KEYS.DESKTOP_VOICEMAIL]: NOTIFICATION_OPTIONS.OFF,
          [SETTING_KEYS.CALL_OPTION]: CALL_OPTION,
        });
        settingService.getById = jest
          .fn()
          .mockReturnValue({ value: { desktopNotifications } });
        mockDefaultSettingItem.state = expectRes;
        const result = await settingHandler.fetchUserSettingEntity();
        expect(result).toEqual(mockDefaultSettingItem);
      },
    );
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(1);
      expect(profileService.updateSettingOptions).toBeCalledWith([
        { value: 1, key: SETTING_KEYS.DESKTOP_VOICEMAIL },
      ]);
    });
  });

  describe('handleProfileUpdated', () => {
    it('should emit update when has subscribe update and.DESKTOP_VOICEMAIL change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          [SETTING_KEYS.DESKTOP_VOICEMAIL]: NOTIFICATION_OPTIONS.ON,
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
          [SETTING_KEYS.DESKTOP_VOICEMAIL]: NOTIFICATION_OPTIONS.OFF,
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
