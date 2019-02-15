/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { BaseResponse, JNetworkError, ERROR_CODES_NETWORK } from 'foundation';
import ProfileService from '../../../service/profile';
import ProfileAPI from '../../../api/glip/profile';
import handleData from '../handleData';
import { UserConfig } from '../../../service/account/UserConfig';
import { daoManager } from '../../../dao';
import { PersonDao } from '../../../module/person/dao';

const mockPersonService = {
  getById: jest.fn().mockImplementation(() => {
    return { me_group_id: 2 };
  }),
};
jest.mock('../../../api/glip/profile');
jest.mock('../../profile/handleData');
jest.mock('../../../service/account/UserConfig');
jest.mock('../../../module/person', () => {
  class MockPersonService {
    static getInstance() {
      return mockPersonService;
    }
  }

  return MockPersonService;
});
ProfileAPI.getDataById = jest.fn();
ProfileAPI.putDataById = jest.fn();

jest.mock('./../../notificationCenter');

describe('ProfileService', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValue(2);
      UserConfig.getCurrentUserProfileId.mockImplementationOnce(() => 2);
      jest.spyOn(profileService, 'getById').mockImplementationOnce(id => id);

      const result = await profileService.getProfile();
      expect(result).toEqual(2);
    });
  });

  describe('favoritePost()', () => {
    it('profile not exist in local should return null', async () => {
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(null);
      expect(profileService.putFavoritePost(100, true)).rejects.not.toBeNull();
    });
    it('favorite post ids in local to like, ', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      const result = await profileService.putFavoritePost(100, true);
      expect(result.favorite_post_ids).toEqual([100, 101, 102]);
    });
    it('should do nothing because post id is not in favorite post ids', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      const result = await profileService.putFavoritePost(103, false);
      expect(result.favorite_post_ids).toEqual([100, 101, 102]);
    });

    it('favorite post ids not in local to like', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      ProfileAPI.putDataById.mockResolvedValue({
        _id: 2,
        favorite_post_ids: [100, 101, 102, 103],
      });
      const returnValue = {
        id: 2,
        favorite_post_ids: [100, 101, 102, 103],
      };
      jest
        .spyOn(profileService, 'handlePartialUpdate')
        .mockResolvedValueOnce(returnValue);

      const result = await profileService.putFavoritePost(103, true);
      expect(result.favorite_post_ids).toEqual([100, 101, 102, 103]);
    });

    it('favorite post ids not in local to unlike', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValue(profile);
      const returnValue = {
        id: 2,
        favorite_post_ids: [100, 101],
      };
      jest
        .spyOn(profileService, 'handlePartialUpdate')
        .mockResolvedValueOnce(returnValue);
      const result = await profileService.putFavoritePost(102, false);
      expect(result.favorite_post_ids).toEqual([100, 101]);
    });
  });

  describe('reorderFavoriteGroups()', () => {
    function setupMock(profile: any, returnValue: any) {
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementationOnce(() => {});
      jest
        .spyOn<ProfileService, any>(profileService, '_doDefaultPartialNotify')
        .mockImplementationOnce(() => {});
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      ProfileAPI.putDataById.mockResolvedValueOnce(returnValue);
      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should reorder back to forward', async () => {
      expect.assertions(1);
      const profile = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      };
      const returnValue = {
        id: 2,
        favorite_group_ids: [2, 1, 3],
      };
      setupMock(profile, returnValue);
      const result = await profileService.reorderFavoriteGroups(1, 0);

      expect(result).toHaveProperty('favorite_group_ids', [2, 1, 3]);
    });

    it('should reorder forward to back', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      };
      const returnValue = {
        id: 2,
        favorite_group_ids: [3, 2, 1],
      };
      setupMock(profile, returnValue);

      const result = await profileService.reorderFavoriteGroups(0, 2);

      expect(result).toHaveProperty('favorite_group_ids', [3, 2, 1]);
    });
  });
  describe('markMeGroupAsFavorite()', () => {
    function setupMock(profile: any, returnValue: any = {}) {
      jest
        .spyOn(profileService, 'handlePartialUpdate')
        .mockResolvedValueOnce(returnValue);
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(profileService, 'getCurrentProfileId')
        .mockReturnValueOnce(profile.id);
      jest.spyOn(UserConfig, 'getCurrentUserId').mockReturnValueOnce(1);
      jest.spyOn(mockPersonService, 'getById').mockResolvedValueOnce(profile);
      ProfileAPI.putDataById.mockResolvedValueOnce(returnValue);
      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('should not add self to favorite when me_tab=true', async () => {
      expect.assertions(1);

      const profile = {
        id: 2,
        favorite_group_ids: [],
        me_tab: true,
      };
      setupMock(profile);

      const result = await profileService.markMeConversationAsFav();
      expect(result).toHaveProperty('favorite_group_ids', []);
    });

    it('should not remove self from favorite when me_tab=true', async () => {
      expect.assertions(1);

      const profile = {
        id: 2,
        favorite_group_ids: [2],
        me_tab: true,
      };
      setupMock(profile);

      const result = await profileService.markMeConversationAsFav();

      expect(result).toHaveProperty('favorite_group_ids', [2]);
    });

    it('should add self to favorite when me_tab=false', async () => {
      expect.assertions(1);
      const profile = {
        id: 2,
        favorite_group_ids: [],
        me_tab: false,
      };
      const apiReturnedProfile = {
        id: 2,
        favorite_group_ids: [2],
        me_tab: true,
      };
      setupMock(profile, apiReturnedProfile);

      jest
        .spyOn(daoManager.getDao(PersonDao), 'get')
        .mockResolvedValueOnce({ me_group_id: 2 });

      const result = await profileService.markMeConversationAsFav();

      expect(result).toHaveProperty('favorite_group_ids', [2]);
    });

    it('should remove self from favorite when me_tab=false', async () => {
      expect.assertions(1);

      const profile = {
        id: 2,
        favorite_group_ids: [99],
        me_tab: false,
      };

      const returnValue = {
        id: 2,
        favorite_group_ids: [],
        me_tab: true,
      };
      setupMock(profile, returnValue);

      jest
        .spyOn(daoManager.getDao(PersonDao), 'get')
        .mockResolvedValueOnce({ me_group_id: 99 });

      const result = await profileService.markMeConversationAsFav();

      expect(result).toHaveProperty('favorite_group_ids', []);
    });
  });

  describe('reopenConversation()', () => {
    function setupMock(profile: any, returnValue: any, ok: boolean = true) {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn<ProfileService, any>(profileService, '_doPartialSaveAndNotify')
        .mockImplementation(() => {});

      if (ok) {
        ProfileAPI.putDataById.mockResolvedValueOnce(returnValue);
      } else {
        ProfileAPI.putDataById.mockRejectedValueOnce(returnValue);
      }

      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should reopen the conversation', async () => {
      expect.assertions(1);

      const profile = {
        id: 2,
      };

      const apiReturnedValue = {
        id: 2,
        hide_group_222233333: false,
      };

      setupMock(profile, apiReturnedValue, true);
      const result = await profileService.reopenConversation(222233333);

      expect(result).toHaveProperty('hide_group_222233333', false);
    });

    it('should return error result when profile not found', async () => {
      jest.spyOn(profileService, 'getById').mockImplementation(id => null);
      await expect(profileService.reopenConversation(1)).rejects.not.toBeNull();
    });

    it('should return error result when api error occurred', async () => {
      const profile = {
        id: 10,
      };
      const apiError = new JNetworkError(ERROR_CODES_NETWORK.FORBIDDEN, '');

      setupMock(profile, apiError, false);

      await expect(profileService.reopenConversation(98)).rejects.toEqual(
        apiError,
      );
    });
  });

  describe('handleGroupIncomesNewPost()', () => {
    function setupMock(profile: any, apiReturnProfile: any) {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      jest
        .spyOn<ProfileService, any>(profileService, '_doPartialSaveAndNotify')
        .mockImplementation(() => {});
      ProfileAPI.putDataById.mockResolvedValueOnce(apiReturnProfile);
    }
    it('should remove group from hidden when group receive new post', async () => {
      expect.assertions(1);

      const profile = {
        id: 2,
        hide_group_222233333: true,
      };
      const apiReturnProfile = {
        id: 2,
        hide_group_222233333: false,
      };
      setupMock(profile, apiReturnProfile);

      const result = await profileService.handleGroupIncomesNewPost([
        222233333,
      ]);

      expect(result).toHaveProperty('hide_group_222233333', false);
    });

    it('should do nothing when visible group receive new post', async () => {
      expect.assertions(1);

      const profile = {
        id: 2,
        hide_group_222233333: false,
      };
      const apiReturnProfile = {};

      setupMock(profile, apiReturnProfile);

      const result = await profileService.handleGroupIncomesNewPost([
        222233333,
      ]);

      expect(result).toHaveProperty('hide_group_222233333', false);
    });
  });

  describe('getMaxLeftRailGroup()', async () => {
    it('should return default value 20 because of not profile', async () => {
      profileService.getProfile = jest
        .fn()
        .mockImplementationOnce(() => undefined);
      const result = await profileService.getMaxLeftRailGroup();
      expect(result).toBe(20);
    });
    it('should return default value 20 because of key max_leftrail_group_tabs2 in profile', async () => {
      profileService.getProfile = jest.fn().mockImplementationOnce(() => {});
      const result = await profileService.getMaxLeftRailGroup();
      expect(result).toBe(20);
    });

    it('should return 5 because of max_leftrail_group_tabs2 in profile is 5', async () => {
      profileService.getProfile = jest.fn().mockImplementationOnce(() => {
        return {
          id: 1,
          max_leftrail_group_tabs2: 5,
        };
      });
      const result = await profileService.getMaxLeftRailGroup();
      expect(result).toBe(5);
    });
  });
});
