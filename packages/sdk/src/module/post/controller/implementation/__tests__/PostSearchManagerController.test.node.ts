/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-19 16:37:01
 * Copyright © RingCentral. All rights reserved.
 */

import { PostSearchManagerController } from '../PostSearchManagerController';
import { PostSearchHandler } from '../PostSearchHandler';

jest.mock('../PostSearchHandler');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PostSearchManagerController', () => {
  let postSearchManagerController: PostSearchManagerController;
  let postSearchHandler: PostSearchHandler;
  function setUp() {
    postSearchHandler = new PostSearchHandler();
    postSearchManagerController = new PostSearchManagerController();
  }
  beforeEach(() => {
    setUp();
    clearMocks();
  });

  describe('endSearch', () => {
    it('should call endSearch in postSearchHandler', async () => {
      const searchKey = 'a';
      postSearchManagerController['_postSearchHandlers'] = new Map([
        [
          searchKey,
          { handler: postSearchHandler, key: searchKey, creationTime: 1 },
        ],
      ]);
      await postSearchManagerController.endSearch(searchKey);
      expect(postSearchHandler.endPostSearch).toBeCalled();
    });
  });

  describe('startSearch', () => {
    it('should call startSearch in postSearchHandler', async () => {
      postSearchManagerController['_postSearchHandlers'] = new Map([
        ['p', { handler: postSearchHandler, key: 'p', creationTime: 1 }],
        ['o', { handler: postSearchHandler, key: 'o', creationTime: 2 }],
      ]);

      const searchParams: any = { q: 'a', type: 'files', scroll_size: 10 };
      await postSearchManagerController.startSearch(searchParams);
      expect(
        postSearchManagerController['_postSearchHandlers'].get('a').handler
          .startSearch,
      ).toBeCalledWith(searchParams);
    });

    it('should just return empty data when no key input', async () => {
      const searchParams: any = { q: '', type: 'files', scroll_size: 10 };
      const res = await postSearchManagerController.startSearch(searchParams);
      expect(res).toEqual({
        contentCount: {},
        hasMore: false,
        items: [],
        posts: [],
        requestId: 0,
      });
    });
  });

  describe('scrollSearch', () => {
    it('should call scroll search in postSearchHandler', async () => {
      const searchKey = 'a';
      postSearchManagerController['_postSearchHandlers'] = new Map([
        [
          searchKey,
          { handler: postSearchHandler, key: searchKey, creationTime: 1 },
        ],
      ]);
      await postSearchManagerController.scrollSearch(searchKey);
      expect(postSearchHandler.scrollSearchPosts).toBeCalled();
    });

    it('should just return when has no postSearchHandler in cache', async () => {
      const searchKey = 'a';
      postSearchManagerController['_postSearchHandlers'] = new Map();
      const res = await postSearchManagerController.scrollSearch(searchKey);
      expect(postSearchHandler.scrollSearchPosts).not.toBeCalled();
      expect(res).toEqual({
        posts: [],
        items: [],
        hasMore: false,
        requestId: 0,
        contentCount: {},
      });
    });
  });
});
