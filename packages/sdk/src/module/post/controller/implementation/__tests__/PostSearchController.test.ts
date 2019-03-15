/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-08 15:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { PostSearchController } from '../PostSearchController';
import { SearchRequestInfo } from '../types';
import { SearchAPI } from '../../../../../api/glip/search';
import { SubscribeController } from '../../../../base/controller/SubscribeController';
import { SOCKET } from '../../../../../service/eventKey';
import { JServerError, ERROR_CODES_SERVER } from '../../../../../error';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

jest.mock('../../../../base/controller/SubscribeController');
jest.mock('../../../../../api/glip/search');

describe('PostSearchController', () => {
  let postSearchController: PostSearchController;
  let subscribeController: SubscribeController;
  let queryInfos: Map<number, SearchRequestInfo>;
  function setUp() {
    queryInfos = new Map();
    subscribeController = new SubscribeController();
    SubscribeController.buildSubscriptionController = jest
      .fn()
      .mockReturnValue(subscribeController);
    subscribeController.subscribe = jest.fn();
    subscribeController.unsubscribe = jest.fn();
    postSearchController = new PostSearchController();
    Object.assign(postSearchController, { _queryInfos: queryInfos });
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should subscribe socket search changed when constructor', () => {
      const controller = new PostSearchController();
      expect(SubscribeController.buildSubscriptionController).toBeCalledWith({
        [SOCKET.SEARCH]: controller.handleSearchResults,
      });
    });
  });

  describe('getContentsCount', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    const searchParams = {
      q: 'name',
      type: 'all',
      fetch_count: 20,
    };
    const newParams = { ...searchParams, count_types: 1 };

    it('should return count when request succeed', async () => {
      expect.assertions(2);
      const countResults = {
        request_id: 388,
        content_types: {
          4: 633,
          9: 9,
          10: 166,
          14: 24,
          17: 13,
          18: 10,
          31: 4,
        },
      };

      const res = { request_id: 388 };
      SearchAPI.search = jest.fn().mockReturnValue(res);
      setTimeout(() => {
        postSearchController.handleSearchResults(countResults);
      },         100);

      const promise = postSearchController.getContentsCount(searchParams);
      const counts = await promise;
      expect(counts).toEqual(countResults.content_types);
      expect(SearchAPI.search).toBeCalledWith(newParams);
    });
  });

  describe('searchPosts', () => {
    const searchParams = { q: 'name', type: 'all', fetch_count: 20 };
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return response with request, and we should save the resolve, reject ', async () => {
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockReturnValue(res);
      const searchedResult: any = {
        request_id: 123,
        client_request_id: 1,
        query: 'name',
        results: [
          {
            _id: 7527966736388,
            created_at: 1548264342023,
            model_id: '7527966736388',
          },

          {
            _id: 10,
            created_at: 1548264342044,
            model_id: '10',
          },
        ],
        just_ids: false,
        response_id: 1,
      };

      setTimeout(() => {
        postSearchController.handleSearchResults(searchedResult);
      },         100);
      const promise = postSearchController.searchPosts(searchParams);
      const itemsAndPosts = await promise;
      expect(itemsAndPosts).toEqual({
        hasMore: true,
        items: [{ created_at: 1548264342044, id: 10, model_id: '10' }],
        posts: [
          {
            created_at: 1548264342023,
            id: 7527966736388,
            model_id: '7527966736388',
          },
        ],
        requestId: 123,
      });
    });
  });

  describe('endPostSearch', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      Object.assign(postSearchController, { _hasSubscribed: true });
    });

    it('should clear local search info and send request to clear request', async () => {
      expect.assertions(3);
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q' });
      SearchAPI.search = jest.fn().mockResolvedValue({});
      await postSearchController.endPostSearch(requestId);
      expect(queryInfos.has(requestId)).toBeFalsy();
      expect(SearchAPI.search).toBeCalledWith({
        previous_server_request_id: requestId,
      });
      expect(subscribeController.unsubscribe).toBeCalled();
    });

    it('it should not throw error even if request failed', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q' });
      const error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'error');
      SearchAPI.search = jest.fn().mockRejectedValue(error);
      expect(
        postSearchController.endPostSearch(requestId),
      ).resolves.not.toThrow();
    });
  });

  describe('handleSearchResults', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should set search ended when ', () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1 });

      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        response_id: 2,
      };
      postSearchController.handleSearchResults(searchedResult);
      expect(
        (queryInfos.get(requestId) as SearchRequestInfo).isSearchEnded,
      ).toBeTruthy();
    });
  });

  describe('scrollSearchPosts', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should throw an error when do scroll search with an not existed request id', async () => {
      const invalidId = Date.now();
      const promise = postSearchController.scrollSearchPosts(invalidId);
      expect(promise).rejects.toThrow();
    });

    it('should set has more info to false when has no more result', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1 });

      const promise = postSearchController.scrollSearchPosts(requestId);
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        just_ids: false,
        response_id: 1,
        scroll_request_id: 1,
      };

      setTimeout(() => {
        postSearchController.handleSearchResults(searchedResult);
      },         100);
      const results = await promise;
      expect(results).toEqual({
        requestId,
        hasMore: false,
        items: [],
        posts: [],
      });
    });

    it('should return next page data when scroll succeed', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1 });

      const promise = postSearchController.scrollSearchPosts(requestId);
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: [
          {
            _id: 7527966736388,
            created_at: 1548264342023,
            model_id: '7527966736388',
          },
          {
            _id: 10,
            created_at: 1548264342044,
            model_id: '10',
          },
        ],
        just_ids: false,
        response_id: 1,
        scroll_request_id: 1,
      };

      setTimeout(() => {
        postSearchController.handleSearchResults(searchedResult);
      },         100);
      const results = await promise;
      expect(results).toEqual({
        requestId,
        hasMore: true,
        items: [{ created_at: 1548264342044, id: 10, model_id: '10' }],
        posts: [
          {
            created_at: 1548264342023,
            id: 7527966736388,
            model_id: '7527966736388',
          },
        ],
      });
    });

    it('should just return empty data with no hasMore when the search is ended', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, {
        q: 'q',
        scrollRequestId: 1,
        isSearchEnded: true,
      });

      const promise = postSearchController.scrollSearchPosts(requestId);
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        response_id: 2,
      };

      setTimeout(() => {
        postSearchController.handleSearchResults(searchedResult);
      },         100);
      const results = await promise;
      expect(results).toEqual({
        requestId,
        hasMore: false,
        items: [],
        posts: [],
      });
    });
  });
});
