/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-10 16:10:37
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileService } from '../ProfileService';
import { ProfileActionController } from '../../controller/ProfileActionController';
import { ProfileDataController } from '../../controller/ProfileDataController';
import { SettingsActionController } from '../../controller/SettingsActionController';

jest.mock('../../../../api');
jest.mock('../../controller/ProfileActionController');
jest.mock('../../controller/ProfileDataController');
jest.mock('../../controller/SettingsActionController');

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

  beforeEach(() => {
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
      ).toBeCalledWith([456]);
    });
  });

  describe('getProfile()', () => {
    it('should call controller', async () => {
      await profileService.getProfile();
      expect(mockProfileDataController.getProfile).toBeCalled();
    });
  });

  describe('isConversationHidden()', () => {
    it('should call controller', async () => {
      await profileService.isConversationHidden(678);
      expect(mockProfileDataController.isConversationHidden).toBeCalledWith(
        678,
      );
    });
  });

  describe('reorderFavoriteGroups()', () => {
    it('should call controller', async () => {
      await profileService.reorderFavoriteGroups(678, 90);
      expect(mockProfileActionController.reorderFavoriteGroups).toBeCalledWith(
        678,
        90,
      );
    });
  });

  describe('markGroupAsFavorite()', () => {
    it('should call controller', async () => {
      await profileService.markGroupAsFavorite(678, false);
      expect(mockProfileActionController.markGroupAsFavorite).toBeCalledWith(
        678,
        false,
      );
    });
  });

  describe('markMeConversationAsFav()', () => {
    it('should call controller', async () => {
      await profileService.markMeConversationAsFav();
      expect(mockProfileActionController.markMeConversationAsFav).toBeCalled();
    });
  });

  describe('putFavoritePost()', () => {
    it('should call controller', async () => {
      await profileService.putFavoritePost(46, true);
      expect(mockProfileActionController.putFavoritePost).toBeCalledWith(
        46,
        true,
      );
    });
  });

  describe('reopenConversation()', () => {
    it('should call controller', async () => {
      await profileService.reopenConversation(46);
      expect(mockProfileActionController.reopenConversation).toBeCalledWith(46);
    });
  });

  describe('hideConversation()', () => {
    it('should call controller', async () => {
      await profileService.hideConversation(46, false, true);
      expect(mockProfileActionController.hideConversation).toBeCalledWith(
        46,
        false,
        true,
      );
    });
  });

  describe('getFavoriteGroupIds()', () => {
    it('should call controller', async () => {
      await profileService.getFavoriteGroupIds();
      expect(mockProfileDataController.getFavoriteGroupIds).toBeCalled();
    });
  });

  describe('updateSettingOptions()', () => {
    it('should call controller', async () => {
      const mockOptions = { mock: 'options' } as any;
      await profileService.updateSettingOptions(mockOptions);
      expect(mockSettingsActionController.updateSettingOptions).toBeCalledWith(
        mockOptions,
      );
    });
  });

  describe('getById', () => {
    it('shoule receive error when id is not correct profile id', async () => {
      try {
        await profileService.getById(1);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });
});
