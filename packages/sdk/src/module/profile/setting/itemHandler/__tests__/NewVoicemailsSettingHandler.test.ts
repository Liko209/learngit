/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileService } from '../../../service/ProfileService';
import notificationCenter from '../../../../../service/notificationCenter';
import { NewVoicemailsSettingHandler } from '../NewVoicemailsSettingHandler';
import {
  UserSettingEntity,
  SettingEntityIds,
  SettingService,
} from '../../../../setting';
import {
  SETTING_KEYS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
  CALLING_OPTIONS,
} from '../../../constants';
import { ENTITY } from 'sdk/service';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { AccountService } from 'sdk/module/account';
jest.mock('../../../service/ProfileService');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NewVoicemailsSettingHandler', () => {
  let profileService: ProfileService;
  let newVoicemailsSettingHandler: NewVoicemailsSettingHandler;
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
      id: SettingEntityIds.Notification_MissCallAndNewVoiceMails,
      state: 0,
      source: [NOTIFICATION_OPTIONS.OFF, NOTIFICATION_OPTIONS.ON],
      value: NOTIFICATION_OPTIONS.OFF,
      valueSetter: expect.any(Function),
    };
    profileService = new ProfileService();
    settingService = new SettingService();
    accoutService = new AccountService(null);
    profileService.updateSettingOptions = jest.fn();
    newVoicemailsSettingHandler = new NewVoicemailsSettingHandler(
      profileService,
      accoutService,
      settingService,
    );
    newVoicemailsSettingHandler.notifyUserSettingEntityUpdate = jest.fn();
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
        const result = await newVoicemailsSettingHandler.fetchUserSettingEntity();
        expect(result).toEqual(mockDefaultSettingItem);
      },
    );
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await newVoicemailsSettingHandler.updateValue(1);
      expect(profileService.updateSettingOptions).toBeCalledWith([
        { value: 1, key: SETTING_KEYS.DESKTOP_VOICEMAIL },
      ]);
    });
  });
});
