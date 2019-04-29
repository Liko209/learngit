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
import {
  JServerError,
  ERROR_CODES_SERVER,
  JError,
  ERROR_TYPES,
} from '../../../../../error';

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
    beforeEach(() => {
      clearMocks();
      setUp();
    });
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
        {
          _id: 18,
          created_at: 1528264342044,
          model_id: '18',
          deactivated: true,
        },
      ],
      just_ids: false,
      response_id: 1,
    };

    it('should continue search post when data size does not match expected count', async () => {
      const searchParams: any = { q: 'name', type: 'all', scroll_size: 10 };
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockResolvedValueOnce(res);

      SearchAPI.scrollSearch = jest
        .fn()
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchController.handleSearchResults({
              request_id: 123,
              client_request_id: 1,
              query: 'name',
              results: [
                {
                  _id: 73007108,
                  created_at: 73007108,
                  model_id: '73007108',
                },
                {
                  _id: 1548298,
                  created_at: 1548264342044,
                  model_id: '10',
                },
              ],
              response_id: 1,
              scroll_request_id: '1',
            });
          },         10);
          return {};
        })
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchController.handleSearchResults({
              request_id: 123,
              client_request_id: 1,
              query: 'name',
              results: [],
              response_id: 1,
              scroll_request_id: '2',
            });
          },         10);
          return {};
        });

      setTimeout(() => {
        postSearchController.handleSearchResults(searchedResult);
      },         100);
      const promise = postSearchController.searchPosts(searchParams);
      const itemsAndPosts = await promise;
      expect(itemsAndPosts).toEqual({
        hasMore: false,
        items: [
          { created_at: 1548264342044, id: 10, model_id: '10' },
          {
            created_at: 1548264342044,
            id: 1548298,
            model_id: '10',
          },
        ],
        posts: [
          {
            created_at: 1548264342023,
            id: 7527966736388,
            model_id: '7527966736388',
          },
          {
            id: 73007108,
            created_at: 73007108,
            model_id: '73007108',
          },
        ],
        requestId: 123,
      });
      expect(SearchAPI.search).toBeCalled();
      expect(SearchAPI.scrollSearch).toBeCalled();
    });

    it('should return response with request, and we should save the resolve, reject ', async () => {
      const searchParams = { q: 'name', type: 'all', scroll_size: 1 };
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockReturnValue(res);

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

    it('should throw an error when search timeout', async () => {
      const searchParams = { q: 'name', type: 'all', scroll_size: 1 } as any;
      const res = { request_id: 123 };
      const error = new Error();
      jest.spyOn(window, 'setTimeout').mockImplementation(() => {
        throw error;
      });

      SearchAPI.search = jest.fn().mockReturnValue(res);

      expect(
        postSearchController.searchPosts(searchParams),
      ).rejects.toThrowError(error);
    });
  });

  describe('endPostSearch', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      Object.assign(postSearchController, { _hasSubscribed: true });
    });

    it('should clear local search info and send request to clear request', async () => {
      expect.assertions(5);
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q' });
      queryInfos.set(requestId + 1, { q: 'k' });
      SearchAPI.search = jest.fn().mockResolvedValue({});
      await postSearchController.endPostSearch();
      expect(queryInfos.has(requestId)).toBeFalsy();
      expect(queryInfos.has(requestId + 1)).toBeFalsy();
      expect(SearchAPI.search).nthCalledWith(1, {
        previous_server_request_id: requestId,
      });
      expect(SearchAPI.search).nthCalledWith(2, {
        previous_server_request_id: requestId + 1,
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

    it('should set search ended when results is null', () => {
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

    it('should just return when request is not in records', () => {
      const requestId = Date.now();
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        response_id: 2,
      };
      postSearchController.handleSearchResults(searchedResult);
      expect(queryInfos.get(requestId)).toBeUndefined();
    });
  });

  describe('scrollSearchPosts', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should throw an error when search timeout when has unended search', async () => {
      const requestId = 123;
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1 });
      jest.spyOn(window, 'setTimeout').mockImplementation((fn: any) => {
        fn();
      });

      SearchAPI.scrollSearch = jest.fn().mockReturnValue({});

      expect(
        postSearchController.scrollSearchPosts(requestId),
      ).rejects.toThrow();
    });

    it('should just return empty data when do scroll search with an not existed request id', async () => {
      const invalidId = Date.now();
      const promise = await postSearchController.scrollSearchPosts(invalidId);

      expect(promise).toEqual({
        hasMore: false,
        items: [],
        posts: [],
        requestId: invalidId,
      });
    });

    it('should throw an error when request encounter an unexpected error', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1 });
      SearchAPI.scrollSearch = jest
        .fn()
        .mockRejectedValue(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.GENERAL,
            'Backend error',
          ),
        );
      expect(
        postSearchController.scrollSearchPosts(requestId),
      ).rejects.toThrow();
    });

    it('should throw not an error when request has beed deleted by server', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1 });
      SearchAPI.scrollSearch = jest
        .fn()
        .mockRejectedValue(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.DELETED,
            'search scroll has been deleted',
          ),
        );
      expect(
        postSearchController.scrollSearchPosts(requestId),
      ).resolves.toEqual({
        requestId,
        hasMore: false,
        items: [],
        posts: [],
      });
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
        scroll_request_id: '1',
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
      expect(SearchAPI.scrollSearch).toBeCalledWith({
        scroll_request_id: 1,
        search_request_id: requestId,
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
        scroll_request_id: '1',
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

    it('should get next page automatically when count does not match', async () => {
      const requestId = Date.now();
      queryInfos.set(requestId, { q: 'q', scrollRequestId: 1, scrollSize: 10 });
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
        scroll_request_id: '1',
      };
      SearchAPI.scrollSearch = jest
        .fn()
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchController.handleSearchResults(searchedResult);
          },         10);
          return {};
        })
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchController.handleSearchResults({
              request_id: requestId,
              query: 'name',
              results: [],
              response_id: 1,
              scroll_request_id: '2',
            });
          },         10);
        });

      const promise = postSearchController.scrollSearchPosts(requestId);

      const results = await promise;
      expect(results).toEqual({
        requestId,
        hasMore: false,
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
  });
});
