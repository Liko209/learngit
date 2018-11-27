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
import { NetworkResultOk, NetworkResultErr } from '../../../api/NetworkResult';

const profileService = new ProfileService();

const mockAccountService = {
  getCurrentUserProfileId: jest.fn(),
  getCurrentUserId: jest.fn().mockImplementationOnce(() => 1),
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
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      mockAccountService.getCurrentUserProfileId.mockImplementationOnce(
        () => 2,
      );
      jest.spyOn(profileService, 'getById').mockImplementationOnce(id => id);

      const result = await profileService.getProfile();
      expect(result).toEqual(2);
    });

    it('should return null when no current user', async () => {
      mockAccountService.getCurrentUserProfileId.mockImplementationOnce(
        () => null,
      );
      jest.spyOn(profileService, 'getById').mockResolvedValueOnce(null);
      const result = await profileService.getProfile();
      expect(result).toBeNull();
    });
  });

  describe('favoritePost()', () => {
    it('profile not exist in local should return null', async () => {
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(null);
      const result = await profileService.putFavoritePost(100, true);
      expect(result).toBeNull();
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
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new NetworkResultOk(
          {
            _id: 2,
            favorite_post_ids: [100, 101, 102, 103],
          },
          200,
          {},
        ),
      );
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
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new NetworkResultOk(
          {
            _id: 2,
            favorite_post_ids: [100, 101],
          },
          200,
          {},
        ),
      );
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
    function setupMock(profile: any, returnValue: any) {
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(profileService, '_doDefaultPartialNotify')
        .mockImplementationOnce(() => {});
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new NetworkResultOk(returnValue, 200, {}),
      );
      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('reorder back to forward', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [1, 2, 3],
      };
      const returnValue = {
        id: 2,
        favorite_group_ids: [2, 1, 3],
      };
      setupMock(profile, returnValue);
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
      const returnValue = {
        id: 2,
        favorite_group_ids: [3, 2, 1],
      };
      setupMock(profile, returnValue);

      const result = (await profileService.reorderFavoriteGroups(0, 2)) || {
        favorite_group_ids: [],
      };
      expect(result['favorite_group_ids']).toEqual([3, 2, 1]);
    });
  });
  describe('markMeGroupAsFavorite', () => {
    function setupMock(profile: any, returnValue: any) {
      jest
        .spyOn(profileService, 'handlePartialUpdate')
        .mockResolvedValueOnce(returnValue);
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(profileService, '_doDefaultPartialNotify')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(profileService, 'getCurrentProfileId')
        .mockReturnValueOnce(profile.id);
      jest.spyOn(mockAccountService, 'getCurrentUserId').mockReturnValueOnce(1);
      jest.spyOn(mockPersonService, 'getById').mockResolvedValueOnce(profile);
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new NetworkResultOk(returnValue, 200, {}),
      );
      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('markMeGroupAsFavorite if an old user logs in', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [2],
        me_tab: true,
      };
      setupMock(profile, {});

      const result = (await profileService.markMeConversationAsFav()) || {
        favorite_group_ids: [],
      };
      expect(result instanceof BaseError).toBeTruthy();
    });
    it('markMeGroupAsFavorite if a new user logs in', async () => {
      const profile = {
        id: 2,
        favorite_group_ids: [],
      };

      const returnValue = {
        id: 2,
        favorite_group_ids: [99],
      };
      setupMock(profile, returnValue);
      const result = (await profileService.markMeConversationAsFav()) || {
        favorite_group_ids: [],
      };
      expect(result['favorite_group_ids']).toEqual([99]);
    });
  });
  describe('hideConversation()', () => {
    function setupMock(profile: any, returnValue: any, ok: boolean = true) {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn(profileService, '_doPartialSaveAndNotify')
        .mockImplementation(() => {});

      if (ok) {
        ProfileAPI.putDataById.mockResolvedValueOnce(
          new NetworkResultOk(returnValue, 200, {}),
        );
      } else {
        ProfileAPI.putDataById.mockResolvedValueOnce(
          new NetworkResultErr(returnValue, 403, {}),
        );
      }

      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('hideConversation, hidden === true, success', async () => {
      const profile = {
        id: 2,
      };
      const returnValue = {
        id: 2,
        hide_group_222233333: true,
        skip_close_conversation_confirmation: true,
      };
      setupMock(profile, returnValue, true);
      const result = await profileService.hideConversation(
        222233333,
        true,
        false,
      );
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
        id: 10,
      };
      setupMock(profile, new BaseError(403, ''), false);

      const result = await profileService.hideConversation(98, true, false);
      if (result instanceof BaseError) {
        expect(result.code).toBe(403);
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
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      jest
        .spyOn(profileService, '_doPartialSaveAndNotify')
        .mockImplementation(() => {});
      const returnValue = {
        id: 2,
        hide_group_222233333: false,
        skip_close_conversation_confirmation: true,
      };

      ProfileAPI.putDataById.mockResolvedValueOnce(
        new NetworkResultOk(returnValue, 200, {}),
      );

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
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);

      jest
        .spyOn(profileService, '_doDefaultPartialNotify')
        .mockImplementationOnce(() => {});

      const result = await profileService.handleGroupIncomesNewPost([
        222233333,
      ]);

      expect(result).toEqual(profile);
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
