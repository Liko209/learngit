/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { AudioTeamMessagesSettingHandler } from '../AudioTeamMessagesSettingHandler';
import { UserSettingEntity, SettingEntityIds } from 'sdk/module/setting';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { ProfileService } from 'sdk/module/profile';
import { SETTING_KEYS, SoundsList } from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { Profile } from '../../../entity';
import { SOUNDS_TYPE, AudioSourceUrl } from '../../../constants';

jest.mock('sdk/module/profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AudioTeamMessagesSettingHandler', () => {
  let profileService: ProfileService;
  let accountService: AccountService;
  let settingHandler: AudioTeamMessagesSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  const mockUserId = 123;
  const defaultSounds = {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Log_Drum}`,
    id: SOUNDS_TYPE.Log_Drum,
  };
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      id: SettingEntityIds.Audio_TeamMessages,
      source: SoundsList,
      value: defaultSounds,
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
    settingHandler = new AudioTeamMessagesSettingHandler(profileService);
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
    it('should get new messages setting value  JPT-2540', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_TEAM_MESSAGES]: SOUNDS_TYPE.Log_Drum,
      });
      const result = await settingHandler.fetchUserSettingEntity();
      expect(result).toEqual(mockDefaultSettingItem);
      const source = result.source || [];
      expect(source.length).toEqual(13);
      expect(source[source.length - 1].id).toEqual(SOUNDS_TYPE.Off);
    });
    it('should return value is default Log_Drum when profile is undefined JPT-2538', async () => {
      profileService.getProfile = jest.fn().mockReturnValue({
        [SETTING_KEYS.AUDIO_INCOMING_CALLS]: undefined,
      });

      const result = await settingHandler.fetchUserSettingEntity();
      expect(result.value).toEqual(defaultSounds);
    });
  });

  describe('updateValue()', () => {
    it('should call updateSettingOptions with correct parameters', async () => {
      await settingHandler.updateValue(defaultSounds);
      expect(profileService.updateSettingOptions).toHaveBeenCalledWith([
        {
          value: SOUNDS_TYPE.Log_Drum,
          key: SETTING_KEYS.AUDIO_TEAM_MESSAGES,
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
          [SETTING_KEYS.AUDIO_TEAM_MESSAGES]: SOUNDS_TYPE.Alert,
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
          [SETTING_KEYS.AUDIO_TEAM_MESSAGES]: SOUNDS_TYPE.Log_Drum,
        } as Profile,
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
