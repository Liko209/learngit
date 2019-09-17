/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-08 15:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { PostSearchHandler } from '../PostSearchHandler';
import { SearchRequestInfo } from '../types';
import { SearchAPI } from 'sdk/api/glip/search';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { SOCKET } from 'sdk/service/eventKey';
import {
  JServerError,
  ERROR_CODES_SERVER,
  JError,
  ERROR_TYPES,
} from 'sdk/error';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

jest.mock('sdk/module/base/controller/SubscribeController');
jest.mock('sdk/api/glip/search');

describe('PostSearchController', () => {
  let postSearchHandler: PostSearchHandler;
  let subscribeController: SubscribeController;
  let searchInfo: SearchRequestInfo;
  function setUp() {
    subscribeController = new SubscribeController();
    SubscribeController.buildSubscriptionController = jest
      .fn()
      .mockReturnValue(subscribeController);
    subscribeController.subscribe = jest.fn();
    subscribeController.unsubscribe = jest.fn();
    postSearchHandler = new PostSearchHandler();
    Object.assign(postSearchHandler, { _searchInfo: searchInfo });
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should subscribe socket search changed when constructor', () => {
      const controller = new PostSearchHandler();
      expect(
        SubscribeController.buildSubscriptionController,
      ).toHaveBeenCalledWith({
        [SOCKET.SEARCH]: controller.handleSearchResults,
      });
    });
  });

  describe('searchPosts', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    const countResults = {
      request_id: 123,
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

    it('should not do search when result count in last search is zero', async () => {
      const searchParams: any = { q: 'name', type: 'files', scroll_size: 10 };
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockResolvedValue(res);
      postSearchHandler['_searchInfo'] = {
        requestId: 123,
        contentTypesRequestId: 123,
        queryOptions: { q: 'q', group_id: 367419394 },
      };
      const lastResult = {
        4: 633,
        9: 9,
        10: 0,
        14: 24,
        17: 13,
        18: 10,
        31: 4,
      };
      postSearchHandler['_lastResultContentCounts'] = lastResult;
      postSearchHandler['_searchInfo'] = { queryOptions: searchParams };
      const result = await postSearchHandler.startSearch(searchParams);
      expect(result).toEqual({
        contentCount: lastResult,
        hasMore: false,
        items: [],
        posts: [],
        requestId: 0,
      });
    });

    it('should continue search post when data size does not match expected count', async () => {
      const searchParams: any = { q: 'name', type: 'all', scroll_size: 10 };
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockResolvedValue(res);
      SearchAPI.scrollSearch = jest
        .fn()
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchHandler.handleSearchResults({
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
                {
                  _id: 46170116,
                  created_at: 1528264342044,
                  model_id: '46170116',
                  deactivated: false,
                  is_sms: true,
                },
                {
                  _id: 56868868,
                  created_at: 1528264342044,
                  model_id: '56868868',
                  deactivated: false,
                  is_sms: false,
                },
              ] as any,
              response_id: 1,
              scroll_request_id: '1',
            });
          }, 10);
          return {};
        })
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchHandler.handleSearchResults({
              request_id: 123,
              client_request_id: 1,
              query: 'name',
              results: [],
              response_id: 1,
              scroll_request_id: '2',
            });
          }, 10);
          return {};
        });

      setTimeout(() => {
        postSearchHandler.handleSearchResults(searchedResult);
        postSearchHandler.handleSearchResults(countResults);
      }, 100);
      const promise = postSearchHandler.startSearch(searchParams);
      const itemsAndPosts = await promise;
      expect(itemsAndPosts).toEqual({
        contentCount: { ...countResults.content_types, '18': 9, '4': 632 },
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
          {
            id: 56868868,
            created_at: 1528264342044,
            model_id: '56868868',
            deactivated: false,
            is_sms: false,
          },
        ],
        requestId: 123,
      });
      expect(SearchAPI.search).toHaveBeenCalled();
      expect(SearchAPI.scrollSearch).toHaveBeenCalled();
    });

    it('should return response with request, and we should save the resolve, reject ', async () => {
      const searchParams = { q: 'name', type: 'all', scroll_size: 1 };
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockReturnValue(res);

      setTimeout(() => {
        postSearchHandler.handleSearchResults(searchedResult);
        postSearchHandler.handleSearchResults(countResults);
      }, 100);
      const promise = postSearchHandler.startSearch(searchParams as any);
      const itemsAndPosts = await promise;
      expect(itemsAndPosts).toEqual({
        contentCount: { ...countResults.content_types, '18': 9 },
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
      expect(postSearchHandler.startSearch(searchParams)).rejects.toThrow(
        error,
      );
      postSearchHandler['_clearSearchTimeout']();
    });

    it('should filter posts which does not belong to search conversation', async () => {
      postSearchHandler['_searchInfo'] = {
        requestId: 123,
        contentTypesRequestId: 124,
        queryOptions: { q: 'q', group_id: 367419394 },
      };
      const searchParams = {
        q: 'name',
        type: 'all',
        scroll_size: 1,
        group_id: 367419394,
      };
      const res = { request_id: 123 };
      SearchAPI.search = jest.fn().mockResolvedValue(res);

      setTimeout(() => {
        postSearchHandler.handleSearchResults({
          request_id: 123,
          client_request_id: 1,
          query: 'name',
          results: [
            {
              _id: 2696437764,
              created_at: 123123,
              model_id: '2696437764',
              group_id: 367419394,
            },
            {
              _id: 2685272068,
              created_at: 123123,
              model_id: '2685272068',
              group_id: 99999,
            },
          ] as any,
          response_id: 1,
        });

        postSearchHandler.handleSearchResults(countResults);
      }, 100);
      const promise = postSearchHandler.startSearch(searchParams as any);
      const itemsAndPosts = await promise;
      expect(itemsAndPosts).toEqual({
        contentCount: {...countResults.content_types, 4: 632},
        hasMore: true,
        items: [],
        posts: [
          {
            created_at: 123123,
            group_id: 367419394,
            id: 2696437764,
            model_id: '2696437764',
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
      Object.assign(postSearchHandler, { _hasSubscribed: true });
    });

    it('should clear local search info and send request to clear request', async () => {
      expect.assertions(3);
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
      };

      SearchAPI.search = jest.fn().mockResolvedValue({});
      await postSearchHandler.endPostSearch();

      expect(SearchAPI.search).toHaveBeenCalledWith({
        previous_server_request_id: requestId,
      });
      expect(subscribeController.unsubscribe).toHaveBeenCalled();
      expect(postSearchHandler['_searchInfo']).toBeUndefined();
    });

    it('it should not throw error even if request failed', async () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
      };
      const error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'error');
      SearchAPI.search = jest.fn().mockRejectedValue(error);
      expect(postSearchHandler.endPostSearch()).resolves.not.toThrow();
    });
  });

  describe('handleSearchResults', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should end search when no search info', async () => {
      postSearchHandler['_searchInfo'] = undefined as any;
      postSearchHandler.endPostSearch = jest.fn();
      await postSearchHandler.handleSearchResults({} as any);
      expect(postSearchHandler.endPostSearch).toHaveBeenCalled();
    });

    it('should set search ended when results is null', () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };

      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        response_id: 2,
      };
      postSearchHandler.handleSearchResults(searchedResult);
      expect(postSearchHandler['_searchInfo'].isSearchEnded).toBeTruthy();
    });

    it('should just return when request is not in records', () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        response_id: 2,
      };
      postSearchHandler['_handlePostsAndItems'] = jest.fn();
      postSearchHandler.handleSearchResults(searchedResult);
      expect(postSearchHandler['_handlePostsAndItems']).not.toHaveBeenCalled();
    });
  });

  describe('scrollSearchPosts', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should throw an error when search timeout when has unended search', async () => {
      const requestId = 123;
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };
      jest
        .spyOn(window, 'setTimeout')
        .mockImplementation((handler: TimerHandler, timeout?: number) => {
          return 0;
        });

      SearchAPI.scrollSearch = jest.fn().mockResolvedValue({});

      expect(postSearchHandler.scrollSearchPosts()).rejects.toThrow();
      postSearchHandler['_clearSearchTimeout']();
    });

    it('should just return empty data when do scroll search but no active search', async () => {
      postSearchHandler['_searchInfo'] = undefined as any;
      const promise = await postSearchHandler.scrollSearchPosts();

      expect(promise).toEqual({
        hasMore: false,
        items: [],
        posts: [],
        requestId: 0,
        contentCount: {},
      });
    });

    it('should throw an error when request encounter an unexpected error', async () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };
      SearchAPI.scrollSearch = jest
        .fn()
        .mockRejectedValue(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.GENERAL,
            'Backend error',
          ),
        );
      expect(postSearchHandler.scrollSearchPosts()).rejects.toThrow();
    });

    it('should throw not an error when request has beed deleted by server', async () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };
      SearchAPI.scrollSearch = jest
        .fn()
        .mockRejectedValue(
          new JError(
            ERROR_TYPES.SERVER,
            ERROR_CODES_SERVER.DELETED,
            'search scroll has been deleted',
          ),
        );
      expect(postSearchHandler.scrollSearchPosts()).resolves.toEqual({
        requestId,
        hasMore: false,
        items: [],
        posts: [],
      });
    });

    it('should set has more info to false when has no more result', async () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };

      const promise = postSearchHandler.scrollSearchPosts();
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        just_ids: false,
        response_id: 1,
        scroll_request_id: '1',
      };

      setTimeout(() => {
        postSearchHandler.handleSearchResults(searchedResult);
      }, 100);
      const results = await promise;
      expect(results).toEqual({
        requestId,
        hasMore: false,
        items: [],
        posts: [],
      });
      expect(SearchAPI.scrollSearch).toHaveBeenCalledWith({
        scroll_request_id: 1,
        search_request_id: requestId,
      });
    });

    it('should return next page data when scroll succeed', async () => {
      const requestId = Date.now();
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
      };

      const promise = postSearchHandler.scrollSearchPosts();
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
        postSearchHandler.handleSearchResults(searchedResult);
      }, 100);
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
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
        isSearchEnded: true,
      };

      const promise = postSearchHandler.scrollSearchPosts();
      const searchedResult: any = {
        request_id: requestId,
        query: 'name',
        results: null,
        response_id: 2,
      };

      setTimeout(() => {
        postSearchHandler.handleSearchResults(searchedResult);
      }, 100);
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
      postSearchHandler['_searchInfo'] = {
        requestId,
        queryOptions: { q: 'q' },
        scrollRequestId: 1,
        scrollSize: 10,
      };
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
            postSearchHandler.handleSearchResults(searchedResult);
          }, 10);
          return {};
        })
        .mockImplementationOnce(() => {
          setTimeout(() => {
            postSearchHandler.handleSearchResults({
              request_id: requestId,
              query: 'name',
              results: [],
              response_id: 1,
              scroll_request_id: '2',
            });
          }, 10);
        });

      const promise = postSearchHandler.scrollSearchPosts();

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
