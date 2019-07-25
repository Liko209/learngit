/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { AudioPhoneSoundsSettingHandler } from '../AudioPhoneSoundsSettingHandler';
import {
  UserSettingEntity,
  SettingEntityIds,
  SettingService,
} from 'sdk/module/setting';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { ProfileService } from 'sdk/module/profile';
import { SETTING_KEYS } from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { Profile } from '../../../entity';
import {
  SOUNDS_TYPE,
  AudioSourceUrl,
  RingsList,
  RINGS_TYPE,
  CALLING_OPTIONS,
} from '../../../constants';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { SOURCE_TYPE } from 'sdk/module/telephony/controller/mediaDeviceDelegate/types';

jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AudioPhoneSoundsSettingHandler', () => {
  let profileService: ProfileService;
  let accountService: AccountService;
  let settingService: SettingService;
  let settingHandler: AudioPhoneSoundsSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  const defaultRings = {
    url: `${AudioSourceUrl}${RINGS_TYPE.High_Gong}`,
    id: RINGS_TYPE.High_Gong,
  };
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      weight: 1,
      parentModelId: 1,
      valueType: 1,
      id: SettingEntityIds.Audio_IncomingCalls,
      source: RingsList,
      value: defaultRings,
      state: 0,
      valueSetter: expect.any(Function),
    };

    profileService = new ProfileService();
    settingService = new SettingService();
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
      if (key === ServiceConfig.SETTING_SERVICE) {
        return settingService;
      }
    });
    profileService.updateSettingOptions = jest.fn();
    settingHandler = new AudioPhoneSoundsSettingHandler(profileService, {
      id: SettingEntityIds.Audio_IncomingCalls,
      setting_key: SETTING_KEYS.AUDIO_INCOMING_CALLS,
      source: RingsList,
      defaultValue: RINGS_TYPE.High_Gong,
    });
    settingService.getById = jest.fn();
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
    it('should get new messages setting value JPT-2540', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_INCOMING_CALLS]: RINGS_TYPE.High_Gong,
      });
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
      const source = result.source || [];
      expect(source.length).toEqual(19);
      expect(source[source.length - 1].id).toEqual(RINGS_TYPE.Off);
    });
    it('should return value is default High_Gong when profile is undefined JPT-2538', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: undefined,
      });

      const result = await settingHandler.fetchUserSettingEntity();
      expect(result.value).toEqual(defaultRings);
    });

    it('should return state is invisible when default app is RingCentral Phone JPT-2536', async () => {
      const value = {
        id: SOUNDS_TYPE.Ching,
        url: `${AudioSourceUrl}${SOUNDS_TYPE.Ching}`,
      };
      settingService.getById = jest
        .fn()
        .mockReturnValue({ value: CALLING_OPTIONS.RINGCENTRAL });

      const result = await settingHandler.fetchUserSettingEntity();
      expect(result.state).toEqual(ESettingItemState.INVISIBLE);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(defaultRings);
      expect(profileService.updateSettingOptions).toHaveBeenCalledWith([
        {
          value: RINGS_TYPE.High_Gong,
          key: SETTING_KEYS.AUDIO_INCOMING_CALLS,
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
          [SETTING_KEYS.AUDIO_INCOMING_CALLS]: RINGS_TYPE.Air_Raid,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toHaveBeenCalled();
        done();
      });
    });

    it('should emit update when has subscribe update', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate<Profile>(ENTITY.USER_SETTING, [
        {
          id: SettingEntityIds.Phone_DefaultApp,
          value: CALLING_OPTIONS.GLIP,
        },
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
          [SETTING_KEYS.AUDIO_INCOMING_CALLS]: RINGS_TYPE.High_Gong,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
