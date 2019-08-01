/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { AudioMessageSoundsSettingHandler } from '../AudioMessageSoundsSettingHandler';
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
  let settingService: SettingService;
  let settingHandler: AudioMessageSoundsSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  const defaultSounds = {
    url: `${AudioSourceUrl}LogDrum2.wav`,
    id: SOUNDS_TYPE.Log_Drum,
  };
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      id: SettingEntityIds.Audio_DirectMessage,
      source: SoundsList,
      value: defaultSounds,
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
    it('should get new messages setting value', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: SOUNDS_TYPE.Log_Drum,
      });
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
    });
    it('should return correct sort of sounds JPT-2540', async () => {
      const result = await settingHandler.fetchUserSettingEntity();
      const sounds = result.source;
      expect(sounds[0].id).toEqual(SOUNDS_TYPE.Double_Beeps);
      expect(sounds[1].id).toEqual(SOUNDS_TYPE.Triple_Beeps);
      expect(sounds[2].id).toEqual(SOUNDS_TYPE.Alert);
      expect(sounds[3].id).toEqual(SOUNDS_TYPE.Alert_Double);
      expect(sounds[4].id).toEqual(SOUNDS_TYPE.Alert_Triple);
      expect(sounds[5].id).toEqual(SOUNDS_TYPE.Bing_Bong);
      expect(sounds[6].id).toEqual(SOUNDS_TYPE.Ching);
      expect(sounds[7].id).toEqual(SOUNDS_TYPE.Log_Drum);
      expect(sounds[8].id).toEqual(SOUNDS_TYPE.Snap);
      expect(sounds[9].id).toEqual(SOUNDS_TYPE.Squirt);
      expect(sounds[10].id).toEqual(SOUNDS_TYPE.Whoosh);
      expect(sounds[11].id).toEqual(SOUNDS_TYPE.Whoosh_Double);
      expect(sounds[12].id).toEqual(SOUNDS_TYPE.Off);
    });
    it('should return value is default Log_Drum when profile is undefined JPT-2538', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: undefined,
      });

      const result = await settingHandler.fetchUserSettingEntity();
      expect(result.value).toEqual(defaultSounds);
    });
    it('should return value is Audio_TeamMessages value when value is default', async () => {
      const value = {
        id: SOUNDS_TYPE.Ching,
        url: `${AudioSourceUrl}${SOUNDS_TYPE.Ching}`,
      };
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: SOUNDS_TYPE.Default,
      });
      settingService.getById = jest.fn().mockReturnValue({ value });

      const result = await settingHandler.fetchUserSettingEntity();
      expect(result.value).toEqual(value);
    });

    it('should return value is Audio_TeamMessages value when value is default', async () => {
      const value = {
        id: SOUNDS_TYPE.Ching,
        url: `${AudioSourceUrl}${SOUNDS_TYPE.Ching}`,
      };
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_DIRECT_MESSAGES]: SOUNDS_TYPE.Default,
      });
      settingService.getById = jest.fn().mockReturnValue({ value });

      const result = await settingHandler.fetchUserSettingEntity();
      expect(result.value).toEqual(value);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(defaultSounds);
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

    it('should emit update when has subscribe update', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate<Profile>(ENTITY.USER_SETTING, [
        {
          id: SettingEntityIds.Audio_TeamMessages,
          value: {
            id: SOUNDS_TYPE.Alert_Double,
            url: `${AudioSourceUrl}${SOUNDS_TYPE.Alert_Double}`,
          },
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
