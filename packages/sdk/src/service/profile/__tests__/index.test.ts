/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
/// <reference path="../../../__tests__/types.d.ts" />
import ProfileService from '../../../service/profile';
import ProfileAPI from '../../../api/glip/profile';
import handleData from '../../profile/handleData';

const profileService = new ProfileService();

const mockAccountService = {
  getCurrentUserProfileId: jest.fn(),
  getCurrentUserId: jest.fn().mockImplementation(() => 1),
};
const mockPersonService = {
  getById: jest.fn().mockImplementation(() => {
    return { me_group_id: 2 };
  }),
};
jest.mock('../../../api/glip/profile');
jest.mock('../../profile/handleData');
jest.mock('../../../service/account', () => {
  class MockAccountService {
    static getInstance() {
      return mockAccountService;
    }
  }

  return MockAccountService;
});
jest.mock('../../../service/person', () => {
  class MockPersonService {
    static getInstance() {
      return mockPersonService;
    }
  }

  return MockPersonService;
});
ProfileAPI.getDataById = jest.fn();
ProfileAPI.putDataById = jest.fn();

describe('ProfileService', () => {
  beforeEach(() => {
    mockAccountService.getCurrentUserProfileId.mockClear();
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      // await profileDao.bulkPut({ id: 1 }, { id: 2 });
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(id => id);

      const result = await profileService.getProfile();
      expect(result).toEqual(2);
    });

    it('should return null when no current user', async () => {
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => null);
      profileService.getById = jest.fn();
      const result = await profileService.getProfile();
      expect(result).toBeNull();
    });
  });

  describe('favoritePost()', () => {
    it('profile not exist in local should return null', async () => {
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => null);
      profileService.getById = jest.fn();
      const result = await profileService.putFavoritePost(100, true);
      expect(result).toBeNull();
    });
    it('favorite post ids in local to like, and not in to un like', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(id => profile);
      let result = await profileService.putFavoritePost(100, true);
      expect(result.favorite_post_ids).toEqual([100, 101, 102]);

      result = await profileService.putFavoritePost(103, false);
      expect(result.favorite_post_ids).toEqual([100, 101, 102]);
    });

    it('favorite post ids not in local to like', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(id => profile);
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: {
          _id: 2,
          favorite_post_ids: [100, 101, 102, 103],
        },
      });
      handleData.mockResolvedValueOnce([
        {
          id: 2,
          favorite_post_ids: [100, 101, 102, 103],
        },
      ]);

      const result = await profileService.putFavoritePost(103, true);
      expect(result.favorite_post_ids).toEqual([100, 101, 102, 103]);
    });

    it('favorite post ids not in local to unlike', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(id => profile);
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: {
          _id: 2,
          favorite_post_ids: [100, 101, 102],
        },
      });
      handleData.mockResolvedValueOnce([
        {
          id: 2,
          favorite_post_ids: [100, 101],
        },
      ]);
      const result = (await profileService.putFavoritePost(102, false)) || {
        favorite_post_ids: [],
      };
      expect(result.favorite_post_ids).toEqual([100, 101]);
    });
  });

  describe('reorderFavoriteGroups', () => {
    it('reorder back to forward', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      };
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(id => profile);
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: profile,
      });
      handleData.mockResolvedValueOnce([profile]);
      const result = (await profileService.reorderFavoriteGroups(1, 0)) || {
        favorite_group_ids: [],
      };
      expect(result.favorite_group_ids).toEqual([2, 1, 3]);
    });

    it('reorder forward to back', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      };
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(id => profile);
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: profile,
      });
      handleData.mockResolvedValueOnce([{ favorite_group_ids: [3, 2, 1] }]);
      const result = (await profileService.reorderFavoriteGroups(0, 2)) || {
        favorite_group_ids: [],
      };
      expect(result.favorite_group_ids).toEqual([3, 2, 1]);
    });
  });
  describe('markMeGroupAsFavorite', () => {
    it('markMeGroupAsFavorite if a new user logs in', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [2],
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: profile,
      });
      profileService.markGroupAsFavorite = jest
        .fn()
        .mockImplementationOnce(() => profile);
      handleData.mockResolvedValueOnce([{ favorite_group_ids: [2] }]);
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(() => profile);
      const result = await profileService.markMeConversationAsFav();
      expect(result.favorite_group_ids).toEqual([2]);
    });
    it('markMeGroupAsFavorite if an old user logs in', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [2],
        me_tab: true,
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: profile,
      });
      profileService.markGroupAsFavorite = jest
        .fn()
        .mockImplementationOnce(() => profile);
      handleData.mockResolvedValueOnce([{ favorite_group_ids: [2] }]);
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      profileService.getById = jest.fn().mockImplementation(() => profile);
      const result = await profileService.markMeConversationAsFav();
      expect(result).toBeUndefined();
    });
  });
});
