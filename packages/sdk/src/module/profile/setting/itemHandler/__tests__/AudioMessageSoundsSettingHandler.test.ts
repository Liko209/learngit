/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { AudioMessageSoundsSettingHandler } from '../AudioMessageSoundsSettingHandler';
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
import { SoundsList, SOUNDS_TYPE, AudioSourceUrl } from '../../../constants';

jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AudioMessageSoundsSettingHandler', () => {
  let profileService: ProfileService;
  let accountService: AccountService;
  let settingHandler: AudioMessageSoundsSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  const sounds = {
    url: `${AudioSourceUrl}LogDrum2.wav`,
    id: SOUNDS_TYPE.Log_Drum,
  };
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      weight: 1,
      parentModelId: 1,
      valueType: 1,
      id: SettingEntityIds.Audio_DirectMessage,
      source: SoundsList,
      value: sounds,
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
    settingHandler = new AudioMessageSoundsSettingHandler(profileService, {
      id: SettingEntityIds.Audio_DirectMessage,
      setting_key: SETTING_KEYS.AUDIO_DIRECT_MESSAGES,
      source: SoundsList,
      defaultValue: SOUNDS_TYPE.Log_Drum,
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
        [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: SOUNDS_TYPE.Log_Drum,
      });
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(sounds);
      expect(profileService.updateSettingOptions).toHaveBeenCalledWith([
        {
          value: SOUNDS_TYPE.Log_Drum,
          key: SETTING_KEYS.AUDIO_DIRECT_MESSAGES,
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
          [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: SOUNDS_TYPE.Alert,
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
          [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: SOUNDS_TYPE.Log_Drum,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
