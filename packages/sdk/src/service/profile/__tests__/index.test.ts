/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:49:44
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { BaseResponse, JNetworkError, ERROR_CODES_NETWORK } from 'foundation';
import ProfileService from '../../../service/profile';
import ProfileAPI from '../../../api/glip/profile';
import { ApiResultOk, ApiResultErr } from '../../../api/ApiResult';
import { ServiceResultOk } from '../../ServiceResult';
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
      const result = await profileService.putFavoritePost(100, true);
      expect(result.isErr()).toBeTruthy();
    });
    it('favorite post ids in local to like, ', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      const result = await profileService.putFavoritePost(100, true);
      if (result.isOk()) {
        expect(result.data.favorite_post_ids).toEqual([100, 101, 102]);
      } else {
        expect(true).toBe(false);
      }
    });
    it('should do nothing because post id is not in favorite post ids', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      const result = await profileService.putFavoritePost(103, false);
      if (result.isOk()) {
        expect(result.data.favorite_post_ids).toEqual([100, 101, 102]);
      } else {
        expect(true).toBe(false);
      }
    });

    it('favorite post ids not in local to like', async () => {
      const profile = {
        id: 2,
        favorite_post_ids: [100, 101, 102],
      };
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      ProfileAPI.putDataById.mockResolvedValue(
        new ApiResultOk(
          {
            _id: 2,
            favorite_post_ids: [100, 101, 102, 103],
          },
          { status: 200, headers: {} } as BaseResponse,
        ),
      );
      const returnValue = {
        id: 2,
        favorite_post_ids: [100, 101, 102, 103],
      };
      jest
        .spyOn(profileService, 'handlePartialUpdate')
        .mockResolvedValueOnce(new ServiceResultOk(returnValue));

      const result = await profileService.putFavoritePost(103, true);
      if (result.isOk()) {
        expect(result.data.favorite_post_ids).toEqual([100, 101, 102, 103]);
      } else {
        expect(true).toBe(false);
      }
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
        .mockResolvedValueOnce(new ServiceResultOk(returnValue));
      const result = await profileService.putFavoritePost(102, false);
      if (result.isOk()) {
        expect(result.data.favorite_post_ids).toEqual([100, 101]);
      } else {
        expect(true).toBe(false);
      }
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
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new ApiResultOk(returnValue, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('favorite_group_ids', [2, 1, 3]);
      }
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('favorite_group_ids', [3, 2, 1]);
      }
    });
  });
  describe('markMeGroupAsFavorite()', () => {
    function setupMock(profile: any, returnValue: any = {}) {
      jest
        .spyOn(profileService, 'handlePartialUpdate')
        .mockResolvedValueOnce(new ServiceResultOk(returnValue));
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn(profileService, 'updatePartialModel2Db')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(profileService, 'getCurrentProfileId')
        .mockReturnValueOnce(profile.id);
      jest.spyOn(UserConfig, 'getCurrentUserId').mockReturnValueOnce(1);
      jest.spyOn(mockPersonService, 'getById').mockResolvedValueOnce(profile);
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new ApiResultOk(returnValue, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('favorite_group_ids', []);
      }
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('favorite_group_ids', [2]);
      }
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('favorite_group_ids', [2]);
      }
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('favorite_group_ids', []);
      }
    });
  });
  describe('hideConversation()', () => {
    function setupMock(profile: any, returnValue: any, ok: boolean = true) {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      jest.spyOn(profileService, 'getProfile').mockResolvedValueOnce(profile);
      jest
        .spyOn<ProfileService, any>(profileService, '_doPartialSaveAndNotify')
        .mockImplementation(() => {});

      if (ok) {
        ProfileAPI.putDataById.mockResolvedValueOnce(
          new ApiResultOk(returnValue, {
            status: 200,
            headers: {},
          } as BaseResponse),
        );
      } else {
        ProfileAPI.putDataById.mockResolvedValueOnce(
          new ApiResultErr(returnValue, {
            status: 200,
            headers: {},
          } as BaseResponse),
        );
      }

      handleData.mockResolvedValueOnce(returnValue);
    }
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should hide the conversation', async () => {
      expect.assertions(2);

      const profile = {
        id: 2,
      };

      const apiReturnedValue = {
        id: 2,
        hide_group_222233333: true,
        skip_close_conversation_confirmation: true,
      };

      setupMock(profile, apiReturnedValue, true);
      const result = await profileService.hideConversation(
        222233333,
        true,
        false,
      );

      if (result.isOk()) {
        expect(result.data).toHaveProperty('hide_group_222233333', true);
        expect(result.data).toHaveProperty(
          'skip_close_conversation_confirmation',
          true,
        );
      }
    });

    it('should return error result when profile not found', async () => {
      jest.spyOn(profileService, 'getById').mockImplementation(id => null);
      const result = await profileService.hideConversation(1, true, false);
      expect(result.isErr()).toBeTruthy();
    });

    it('should return error result when api error occurred', async () => {
      const profile = {
        id: 10,
      };
      const apiError = new JNetworkError(ERROR_CODES_NETWORK.FORBIDDEN, '');

      setupMock(profile, apiError, false);

      const result = await profileService.hideConversation(98, true, false);

      expect(result.isErr()).toBeTruthy();
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
        ProfileAPI.putDataById.mockResolvedValueOnce(
          new ApiResultOk(returnValue, {
            status: 200,
            headers: {},
          } as BaseResponse),
        );
      } else {
        ProfileAPI.putDataById.mockResolvedValueOnce(
          new ApiResultErr(returnValue, {
            status: 200,
            headers: {},
          } as BaseResponse),
        );
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('hide_group_222233333', false);
      }
    });

    it('should return error result when profile not found', async () => {
      jest.spyOn(profileService, 'getById').mockImplementation(id => null);
      const result = await profileService.reopenConversation(1);
      expect(result.isErr()).toBeTruthy();
    });

    it('should return error result when api error occurred', async () => {
      const profile = {
        id: 10,
      };
      const apiError = new JNetworkError(ERROR_CODES_NETWORK.FORBIDDEN, '');

      setupMock(profile, apiError, false);

      const result = await profileService.reopenConversation(98);

      expect(result.isErr()).toBeTruthy();
    });
  });

  describe('handleGroupIncomesNewPost()', () => {
    function setupMock(profile: any, apiReturnProfile: any) {
      jest.spyOn(profileService, 'getCurrentProfileId').mockReturnValueOnce(2);
      jest.spyOn(profileService, 'getById').mockReturnValue(profile);
      jest
        .spyOn<ProfileService, any>(profileService, '_doPartialSaveAndNotify')
        .mockImplementation(() => {});
      ProfileAPI.putDataById.mockResolvedValueOnce(
        new ApiResultOk(apiReturnProfile, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('hide_group_222233333', false);
      }
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

      if (result.isOk()) {
        expect(result.data).toHaveProperty('hide_group_222233333', false);
      }
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
