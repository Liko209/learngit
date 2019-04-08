/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-11 18:31:48
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../../controller/PostController';
import { PostSearchController } from '../../controller/implementation/PostSearchController';
import { PostService } from '../PostService';

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
