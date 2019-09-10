/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-10 16:10:37
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileService } from '../ProfileService';
import { ProfileActionController } from '../../controller/ProfileActionController';
import { ProfileDataController } from '../../controller/ProfileDataController';
import { SettingsActionController } from '../../controller/SettingsActionController';
import { ProfileSetting } from '../../setting/ProfileSetting';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { SettingService } from 'sdk/module/setting/service/SettingService';

jest.mock('sdk/dao');
jest.mock('sdk/module/setting/service/SettingService', () => {
  const mock: SettingService = {
    registerModuleSetting: jest.fn(),
    unRegisterModuleSetting: jest.fn(),
  } as any;
  return {
    SettingService: () => mock,
  };
});
jest.mock('../../../../api');
jest.mock('../../controller/ProfileActionController');
jest.mock('../../controller/ProfileDataController');
jest.mock('../../controller/SettingsActionController');
jest.mock('../../setting/ProfileSetting', () => {
  const mock: ProfileSetting = {
    getById: jest.fn(),
    getHandlerMap: jest.fn(),
  } as any;
  return {
    ProfileSetting: () => {
      return mock;
    },
  };
});

describe('ProfileService', () => {
  let profileService: ProfileService;
  const mockProfileActionController = new ProfileActionController(
    {} as any,
    {} as any,
    {} as any,
  );
  const mockProfileDataController = new ProfileDataController({} as any);
  const mockSettingsActionController = new SettingsActionController(
    {} as any,
    {} as any,
    {} as any,
  );
  let mockProfileSetting: ProfileSetting;
  let mockSettingService: SettingService;
  beforeEach(() => {
    mockProfileSetting = new ProfileSetting({} as any);
    mockSettingService = new SettingService();
    profileService = new ProfileService();
    profileService['profileController'] = {
      getProfileDataController: jest
        .fn()
        .mockReturnValue(mockProfileDataController),
      getProfileActionController: jest
        .fn()
        .mockReturnValue(mockProfileActionController),
      getSettingsActionController: jest
        .fn()
        .mockReturnValue(mockSettingsActionController),
    } as any;

    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.SETTING_SERVICE) {
        return mockSettingService;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('handleGroupIncomesNewPost()', () => {
    it('should call controller', async () => {
      await profileService.handleGroupIncomesNewPost([456]);
      expect(
        mockProfileActionController.handleGroupIncomesNewPost,
      ).toHaveBeenCalledWith([456]);
    });
  });

  describe('getProfile()', () => {
    it('should call controller', async () => {
      await profileService.getProfile();
      expect(mockProfileDataController.getProfile).toHaveBeenCalled();
    });
  });

  describe('isConversationHidden()', () => {
    it('should call controller', async () => {
      await profileService.isConversationHidden(678);
      expect(
        mockProfileDataController.isConversationHidden,
      ).toHaveBeenCalledWith(678);
    });
  });

  describe('getConversationPreference()', () => {
    it('should call controller', async () => {
      await profileService.getConversationPreference(1);
      expect(
        mockProfileDataController.getConversationPreference,
      ).toHaveBeenCalled();
    });
  });
  describe('updateConversationPreference()', () => {
    it('should call controller', async () => {
      await profileService.updateConversationPreference(1, {});
      expect(
        mockSettingsActionController.updateConversationPreference,
      ).toHaveBeenCalled();
    });
  });

  describe('isNotificationMute()', () => {
    it('should call controller', async () => {
      await profileService.isNotificationMute(1);
      expect(mockProfileDataController.isNotificationMute).toHaveBeenCalledWith(
        1,
      );
    });
  });

  describe('reorderFavoriteGroups()', () => {
    it('should call controller', async () => {
      await profileService.reorderFavoriteGroups([1, 2], 678, 90);
      expect(
        mockProfileActionController.reorderFavoriteGroups,
      ).toHaveBeenCalledWith([1, 2], 678, 90);
    });
  });

  describe('markGroupAsFavorite()', () => {
    it('should call controller', async () => {
      await profileService.markGroupAsFavorite(678, false);
      expect(
        mockProfileActionController.markGroupAsFavorite,
      ).toHaveBeenCalledWith(678, false);
    });
  });

  describe('markMeConversationAsFav()', () => {
    it('should call controller', async () => {
      await profileService.markMeConversationAsFav();
      expect(
        mockProfileActionController.markMeConversationAsFav,
      ).toHaveBeenCalled();
    });
  });

  describe('putFavoritePost()', () => {
    it('should call controller', async () => {
      await profileService.putFavoritePost(46, true);
      expect(mockProfileActionController.putFavoritePost).toHaveBeenCalledWith(
        46,
        true,
      );
    });
  });

  describe('reopenConversation()', () => {
    it('should call controller', async () => {
      await profileService.reopenConversation(46);
      expect(
        mockProfileActionController.reopenConversation,
      ).toHaveBeenCalledWith(46);
    });
  });

  describe('hideConversation()', () => {
    it('should call controller', async () => {
      await profileService.hideConversation(46, false, true);
      expect(mockProfileActionController.hideConversation).toHaveBeenCalledWith(
        46,
        false,
        true,
      );
    });
  });

  describe('getFavoriteGroupIds()', () => {
    it('should call controller', async () => {
      await profileService.getFavoriteGroupIds();
      expect(mockProfileDataController.getFavoriteGroupIds).toHaveBeenCalled();
    });
  });

  describe('updateSettingOptions()', () => {
    it('should call controller', async () => {
      const mockOptions = { mock: 'options' } as any;
      await profileService.updateSettingOptions(mockOptions);
      expect(
        mockSettingsActionController.updateSettingOptions,
      ).toHaveBeenCalledWith(mockOptions);
    });
  });

  describe('getById', () => {
    it('should receive error when id is not correct profile id', async () => {
      try {
        await profileService.getById(1);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });

  describe('onStart', () => {
    it('should call registerModuleSetting', () => {
      profileService['_profileSetting'] = mockProfileSetting;
      // mockProfileSetting.unsubscribe = jest.fn();
      profileService['onStarted']();
      expect(mockSettingService.registerModuleSetting).toHaveBeenCalledWith(
        mockProfileSetting,
      );
    });
  });

  describe('onStop', () => {
    it('should call unsubscribe of profile setting', () => {
      profileService['_profileSetting'] = mockProfileSetting;
      // mockProfileSetting.unsubscribe = jest.fn();
      profileService['onStopped']();
      expect(mockSettingService.unRegisterModuleSetting).toHaveBeenCalledWith(
        mockProfileSetting,
      );
    });
  });
});
