/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
/// <reference path="../../../__tests__/types.d.ts" />
import ProfileService from '../../../service/profile';
import ProfileAPI from '../../../api/glip/profile';
import handleData, {
  handlePartialProfileUpdate,
} from '../../profile/handleData';
import { BaseError } from '../../../utils';

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
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      // await profileDao.bulkPut({ id: 1 }, { id: 2 });
      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => 2);
      jest.spyOn(profileService, 'getById').mockImplementation(id => id);

      const result = await profileService.getProfile();
      expect(result).toEqual(2);
    });

    it('should return null when no current user', async () => {
      mockAccountService.getCurrentUserProfileId.mockImplementation(() => null);
      jest.spyOn(profileService, 'getById');
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
      handlePartialProfileUpdate.mockResolvedValueOnce({
        id: 2,
        favorite_post_ids: [100, 101, 102, 103],
      });

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
      handlePartialProfileUpdate.mockResolvedValueOnce({
        id: 2,
        favorite_post_ids: [100, 101],
      });
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

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const returnValue = {
        id: 2,
        favorite_group_ids: [2, 1, 3],
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: returnValue,
      });
      handleData.mockResolvedValueOnce(returnValue);
      const result = (await profileService.reorderFavoriteGroups(1, 0)) || {
        favorite_group_ids: [],
      };
      expect(result['favorite_group_ids']).toEqual([2, 1, 3]);
    });

    it('reorder forward to back', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      };

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const returnValue = {
        id: 2,
        favorite_group_ids: [3, 2, 1],
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: returnValue,
      });
      handleData.mockResolvedValueOnce(returnValue);
      const result = (await profileService.reorderFavoriteGroups(0, 2)) || {
        favorite_group_ids: [],
      };
      expect(result['favorite_group_ids']).toEqual([3, 2, 1]);
    });
  });
  describe('markMeGroupAsFavorite', () => {
    it('markMeGroupAsFavorite if a new user logs in', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [],
      };

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const returnValue = {
        id: 2,
        favorite_group_ids: [2],
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: returnValue,
      });
      handleData.mockResolvedValueOnce(returnValue);
      const result = (await profileService.markMeConversationAsFav()) || {
        favorite_group_ids: [],
      };
      expect(result['favorite_group_ids']).toEqual([2]);
    });
    it('markMeGroupAsFavorite if an old user logs in', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [2],
        me_tab: true,
      };

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const result = (await profileService.markMeConversationAsFav()) || {
        favorite_group_ids: [],
      };
      expect(result instanceof BaseError).toBeTruthy();
    });
  });
  describe('hideConversation()', () => {
    it('hideConversation, hidden === true, success', async () => {
      const profile = {
        id: 2,
      };

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const returnValue = {
        id: 2,
        hide_group_222233333: true,
        skip_close_conversation_confirmation: true,
      };
      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: returnValue,
      });
      handleData.mockResolvedValueOnce(returnValue);
      const result = await profileService.hideConversation(
        222233333,
        true,
        false,
      );
      console.log('result----------------', result);
      expect(result['hide_group_222233333']).toBe(true);
      expect(result['skip_close_conversation_confirmation']).toBe(true);
    });
    it('hideConversation, none profile', async () => {
      jest.spyOn(profileService, 'getById').mockImplementation(id => null);
      const result = await profileService.hideConversation(1, true, false);
      expect(result instanceof BaseError).toBe(true);
    });
    it('hideConversation, network error', async () => {
      const profile = {
        id: 2,
      };
      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);

      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

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
  describe('handleGroupIncomesNewPost()', async () => {
    it('has hidden group, should open', async () => {
      const profile = {
        id: 2,
        hide_group_222233333: true,
      };

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const returnValue = {
        id: 2,
        hide_group_222233333: false,
        skip_close_conversation_confirmation: true,
      };

      ProfileAPI.putDataById.mockResolvedValueOnce({
        data: returnValue,
      });

      const result = await profileService.handleGroupIncomesNewPost([
        222233333,
      ]);
      expect(result['hide_group_222233333']).toBe(false);
    });
    it('has not hidden group, do nothing', async () => {
      const profile = {
        id: 2,
        hide_group_222233333: false,
      };

      jest.spyOn(profileService, 'getCurrentProfileId').mockResolvedValue(2);

      jest.spyOn(profileService, 'getById').mockResolvedValue(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementation(() => {});
      jest
        .spyOn(profileService, 'doDefaultPartialNotify')
        .mockImplementation(() => {});

      const result = await profileService.handleGroupIncomesNewPost([
        222233333,
      ]);

      expect(result).toEqual(profile);
    });
  });
});
