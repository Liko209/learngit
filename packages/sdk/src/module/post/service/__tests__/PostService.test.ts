/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-11 18:31:48
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../../controller/PostController';
import { PostSearchController } from '../../controller/implementation/PostSearchController';
import { PostService } from '../PostService';
import { PostDataController } from '../../controller/PostDataController';

jest.mock('../../../account/config/AccountUserConfig');
jest.mock('../../../../framework/controller/impl/EntityNotificationController');
jest.mock('../../controller/PostDataController');
jest.mock('../../controller/PostController');
jest.mock('../../controller/implementation/PostSearchController');
jest.mock('../../../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PostService', () => {
  let postService: PostService;
  let postController: PostController;
  function setUp() {
    postController = new PostController();
    postService = new PostService();
  }

  beforeEach(() => {
    clearMocks();
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
});
