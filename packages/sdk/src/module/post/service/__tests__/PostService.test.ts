/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-11 18:31:48
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../../controller/PostController';
import { PostSearchController } from '../../controller/implementation/PostSearchController';
import { PostService } from '../PostService';
import { PostDataController } from '../../controller/PostDataController';
import { ProfileService } from '../../../profile';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { GroupService } from '../../../group';
import { AccountService } from '../../../account/service';

jest.mock('../../../account/config/AccountUserConfig', () => {
  const xx = {
    getGlipUserId() {
      return 1;
    },
  };
  return {
    AccountUserConfig: () => {
      return xx;
    },
  };
});

jest.mock('../../../group');
jest.mock('../../controller/PostDataController');
jest.mock('../../controller/PostController');
jest.mock('../../controller/implementation/PostSearchController');
jest.mock('../../../../api');
jest.mock('../../../../dao');
jest.mock('../../../profile');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PostService', () => {
  let profileService: ProfileService;
  let postService: PostService;
  let postController: PostController;
  let groupService: GroupService;
  let accountService: AccountService;
  function setUp() {
    profileService = new ProfileService();
    groupService = new GroupService();
    postController = new PostController();
    postService = new PostService();

    const serviceMap = new Map([[ServiceConfig.GROUP_SERVICE, groupService]]);

    ServiceLoader.getInstance = jest.fn().mockImplementation(name => {
      return serviceMap.get(name);
    });
    accountService = new AccountService();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.PROFILE_SERVICE) {
          return profileService;
        }
        if (serviceName === ServiceConfig.ACCOUNT_SERVICE) {
          return accountService;
        }
      });
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('canSaveRemoteEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('should return false', () => {
      const result = postService['canSaveRemoteEntity']();
      expect(result).toBeFalsy();
    });
  });

  describe('handleSexioData', () => {
    let postDataController: PostDataController;
    beforeEach(() => {
      clearMocks();
      setUp();
      postDataController = new PostDataController(
        null as any,
        null as any,
        null as any,
      );

      postController.getPostDataController = jest
        .fn()
        .mockImplementation(() => {
          return postDataController;
        });
      postService.postController = postController;
    });

    it('should call entity notification controller and post data handle controller', async () => {
      const rawPost = [{ _id: 1 }, { _id: 2 }] as any;
      const post = [{ id: 1 }, { id: 2 }] as any;
      postDataController.transformData = jest.fn().mockReturnValue(post);
      const notificationController = postService.getEntityNotificationController();
      notificationController['onReceivedNotification'] = jest.fn();
      await postService.handleSexioData(rawPost);

      expect(postDataController.transformData).toBeCalledWith(rawPost);
      expect(postDataController.handleSexioPosts).toBeCalledWith(post);
      expect(notificationController.onReceivedNotification).toBeCalledWith(
        post,
      );
    });

    it('should call post data controller', async () => {
      const rawPost = [{ _id: 1 }, { _id: 2 }] as any;
      await postService.handleIndexData(rawPost, true);
      expect(postDataController.handleIndexPosts).toBeCalledWith(
        rawPost,
        true,
        undefined,
      );
    });
  });
  describe('PostSearchController', () => {
    let postSearchController: PostSearchController;
    beforeEach(() => {
      clearMocks();
      setUp();

      postSearchController = new PostSearchController();
      postController.getPostSearchController = jest
        .fn()
        .mockImplementation(() => {
          return postSearchController;
        });

      postService.postController = postController;
    });

    it('searchPosts', async () => {
      const params = { q: '11' };
      await postService.searchPosts(params);
      expect(postSearchController.searchPosts).toBeCalledWith(params);
    });

    it('getSearchContentsCount', async () => {
      const params = { q: '11' };
      await postService.getSearchContentsCount(params);
      expect(postSearchController.getContentsCount).toBeCalledWith(params);
    });

    it('scrollSearchPosts', async () => {
      const requestId = Date.now();
      await postService.scrollSearchPosts(requestId);
      expect(postSearchController.scrollSearchPosts).toBeCalledWith(requestId);
    });

    it('endPostSearch', async () => {
      await postService.endPostSearch();
      expect(postSearchController.endPostSearch).toBeCalledWith();
    });
  });

  describe('bookmarkPost', () => {
    it('bookmarkPost', async () => {
      await postService.bookmarkPost(1, true);
      expect(profileService.putFavoritePost).toBeCalledWith(1, true);
    });
  });
  describe('getById', () => {
    it('shoule receive error when id is not correct post id', async () => {
      try {
        await postService.getById(1);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });
});
