/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
/// <reference path="../../../__tests__/types.d.ts" />
import ProfileService from '../../../service/profile';
import ProfileAPI from '../../../api/glip/profile';
import handleData from '../../profile/handleData';
import { BaseError } from '../../../utils';

const profileService = new ProfileService();

const mockAccountService = {
  getCurrentUserProfileId: jest.fn(),
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
      const result = await profileService.putFavoritePost(102, false) || { favorite_post_ids: [] };
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
      const result = await profileService.reorderFavoriteGroups(1, 0) || { favorite_group_ids: [] };
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
      const result = await profileService.reorderFavoriteGroups(0, 2) || { favorite_group_ids: [] };
      expect(result.favorite_group_ids).toEqual([3, 2, 1]);
    });
  });
  describe('markGroupAsFavorite', () => {
    it('', () => { });
  });
  describe('hideConversation', () => {
    it('hideConversation, hidden === true, success', async () => {
      const profile = {
        id: 2,
      };
      profileService.getProfile = jest.fn().mockImplementationOnce(() => profile);
      const returnValue = {
        id: 2,
        hide_group_222233333: true,
        skip_close_conversation_confirmation: true,
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: returnValue,
      });
      handleData.mockResolvedValueOnce([returnValue]);
      const result = await profileService.hideConversation(222233333, true, false);
      expect(result['hide_group_222233333']).toBe(true);
      expect(result['skip_close_conversation_confirmation']).toBe(true);
    });
    it('hideConversation, none profile', async () => {
      profileService.getById = jest.fn().mockImplementation(id => null);
      const result = await profileService.hideConversation(1, true, false);
      expect(result instanceof BaseError).toBe(true);
    });
    it('hideConversation, network error', async () => {
      const profile = {
        id: 2,
      };
      profileService.getProfile = jest.fn().mockImplementationOnce(() => profile);
      ProfileAPI.putDataById.mockResolvedValueOnce({
        status: 403,
      });
      const result = await profileService.hideConversation(1, true, false);
      if (result instanceof BaseError) {
        expect(result.code).toBe(1403);
      } else {
        expect(false).toBe(true);
      }
    });
  });
});
