/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RC_INFO, ENTITY, SERVICE } from 'sdk/service';
import notificationCenter from 'sdk/service/notificationCenter';
import {
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { DefaultAppSettingHandler } from '../DefaultAppSettingHandler';
import { ProfileService } from 'sdk/module/profile/service/ProfileService';
import { TelephonyService } from 'sdk/module/telephony/service/TelephonyService';
import { AccountService } from 'sdk/module/account';

import { ESettingItemState } from 'sdk/framework/model/setting';
import { CALLING_OPTIONS, SETTING_KEYS } from 'sdk/module/profile';
import { Profile } from 'sdk/module/profile/entity';
import { GLIP_LOGIN_STATUS } from 'sdk/framework';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
jest.mock('sdk/dao');
jest.mock('sdk/module/profile/service/ProfileService');
jest.mock('sdk/module/account');
jest.mock('sdk/module/telephony/service/TelephonyService');
jest.mock('sdk/service/socket');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('DefaultAppSettingHandler', () => {
  let profileService: ProfileService;
  let telephonyService: TelephonyService;
  let accountService: AccountService;
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: DefaultAppSettingHandler;
  const mockUserId = 123;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    profileService = new ProfileService();
    telephonyService = new TelephonyService();
    accountService = new AccountService(null);
    profileService.getProfile = jest.fn().mockReturnValue({
      id: mockUserId,
    });
    profileService.updateSettingOptions = jest.fn().mockResolvedValue('');
    telephonyService.getVoipCallPermission = jest.fn().mockResolvedValue(true);
    accountService.userConfig = jest.fn();
    accountService.userConfig.getCurrentUserProfileId = jest.fn().mockReturnValue(mockUserId);
    accountService.getGlipLoginStatus = jest.fn().mockReturnValue(GLIP_LOGIN_STATUS.SUCCESS);
    mockDefaultSettingItem = {
      id: SettingEntityIds.Phone_DefaultApp,
      valueSetter: expect.anything(),
      value: CALLING_OPTIONS.GLIP,
      state: 0,
    };
    settingHandler = new DefaultAppSettingHandler();
    ServiceLoader.getInstance = jest.fn().mockImplementation((config:string) => {
      if(config === ServiceConfig.PROFILE_SERVICE) {
        return profileService;
      }
      if(config === ServiceConfig.TELEPHONY_SERVICE) {
        return telephonyService;
      }
      if(config === ServiceConfig.ACCOUNT_SERVICE) {
        return accountService;
      }
    })
  }

  function cleanUp() {
    settingHandler.dispose();
  }

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should subscribe notification when create self', () => {
      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.PROFILE,
        expect.any(Function),
      );
      expect(notificationCenter.on).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
        expect.any(Function),
      );
    });
  });

  describe('handleProfileUpdated', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when has subscribe update', (done: jest.DoneCallback) => {
      mockDefaultSettingItem.value = CALLING_OPTIONS.GLIP;
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          calling_option: CALLING_OPTIONS.RINGCENTRAL,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();

        done();
      });
    });

    it('should not emit update when no change', (done: jest.DoneCallback) => {
      mockDefaultSettingItem.value = CALLING_OPTIONS.GLIP;
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate<Profile>(ENTITY.PROFILE, [
        {
          id: mockUserId,
          calling_option: CALLING_OPTIONS.GLIP,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        done();
      });
    });

    it('should not emit when has no cache', (done: jest.DoneCallback) => {
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate(RC_INFO.CLIENT_INFO, [
        {
          id: 1,
        },
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        done();
      });
    });
  });
  describe('handle VOIP_CALLING change', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when VOIP_CALLING change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emit(SERVICE.TELEPHONY_SERVICE.VOIP_CALLING);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        done();
      });
    });
  });

  describe('handle GLIP_LOGIN change', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when GLIP_LOGIN change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emit(SERVICE.GLIP_LOGIN, {success: true, isFirstLogin: true});
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        done();
      });
    });
  });

  describe('fetchUserSettingEntity()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should state be ENABLE when has callPermission', async () => {
      telephonyService.getVoipCallPermission.mockResolvedValue(false);

      const res = await settingHandler.fetchUserSettingEntity();
      expect(res.state).toEqual(ESettingItemState.INVISIBLE);
    });
    it('should state be INVISIBLE when has NOT callPermission', async () => {
      telephonyService.getVoipCallPermission.mockResolvedValue(true);

      const res = await settingHandler.fetchUserSettingEntity();
      expect(res.state).toEqual(ESettingItemState.ENABLE);
    });
    it('should return value is glip when backend value is undefined', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.CALL_OPTION]: undefined,
      });
      telephonyService.getVoipCallPermission.mockResolvedValue(false);

      const res = await settingHandler.fetchUserSettingEntity();
      expect(res.value).toEqual(CALLING_OPTIONS.GLIP);
    });
    it('should return value is ringcentral when backend value is ringcentral', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.CALL_OPTION]: CALLING_OPTIONS.RINGCENTRAL,
      });
      telephonyService.getVoipCallPermission.mockResolvedValue(false);

      const res = await settingHandler.fetchUserSettingEntity();
      expect(res.value).toEqual(CALLING_OPTIONS.RINGCENTRAL);
    });
    it('should return glip when glip login failed', async () => {
      accountService.getGlipLoginStatus = jest.fn().mockReturnValue(GLIP_LOGIN_STATUS.PROCESS);
      telephonyService.getVoipCallPermission.mockResolvedValue(false);

      const res = await settingHandler.fetchUserSettingEntity();
      expect(res.value).toEqual(CALLING_OPTIONS.GLIP);
    });

    it('should return entity', async () => {
      const mockProfile = {
        id: mockUserId,
        calling_option: CALLING_OPTIONS.GLIP,
      };
      telephonyService.getVoipCallPermission.mockResolvedValue(true);
      profileService.getProfile.mockResolvedValue(mockProfile);
      const res = await settingHandler.fetchUserSettingEntity();
      // expect(settingHandler.updateUserSettingEntityCache).toBeCalledWith(res);
      expect(res).toEqual({
        id: SettingEntityIds.Phone_DefaultApp,
        state: ESettingItemState.ENABLE,
        source: [CALLING_OPTIONS.GLIP, CALLING_OPTIONS.RINGCENTRAL],
        value: CALLING_OPTIONS.GLIP,
        valueSetter: expect.anything(),
      });
    });
  });

  describe('updateValue()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should call profileService.updateSettingOptions', async () => {
      const value = {};
      await settingHandler.updateValue(value as any);
      expect(profileService.updateSettingOptions).toBeCalledWith([
        {
          value,
          key: SETTING_KEYS.CALL_OPTION,
        },
      ]);
    });
  });
});
