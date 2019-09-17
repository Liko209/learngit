/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-14 17:18:57
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { Raw } from 'sdk/framework/model';
import { Item } from 'sdk/module/item/entity';
import { SOCKET } from 'sdk/service/eventKey';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import {
  SearchResult,
  SearchContentTypesCount,
  SearchedResultData,
  SearchRequestInfo,
} from './types';
import {
  SearchAPI,
  ContentSearchParams,
  ESearchContentTypes,
} from 'sdk/api/glip/search';
import { transformAll } from 'sdk/service/utils';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import {
  ERROR_TYPES,
  ErrorParserHolder,
  JNetworkError,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import { UndefinedAble } from 'sdk/types';
import { EmptySearchRes, SearchFilterTypes, TYPE_ID_OF_ALL } from './constants';
import { POST_PERFORMANCE_KEYS } from '../../config/performanceKeys';
import { Post } from '../../entity';
import { PostControllerUtils } from './PostControllerUtils';

const SEARCH_TIMEOUT = 60 * 1000;

const SEARCH_CONDITION_KEYS = [
  'creator_id',
  'group_id',
  'begin_time',
  'end_time',
  'for_at_mention',
];

const LOG_TAG = 'PostSearchHandler';
class PostSearchHandler {
  private _searchInfo: SearchRequestInfo;
  private _subscribeController: SubscribeController;
  private _searchResultWaiter: NodeJS.Timer;
  private _lastResultContentCounts: SearchContentTypesCount;
  constructor() {
    this._subscribeController = SubscribeController.buildSubscriptionController(
      {
        [SOCKET.SEARCH]: this.handleSearchResults,
      },
    );
  }

  async startSearch(options: ContentSearchParams): Promise<SearchedResultData> {
    if (!this._needDoSearch(options)) {
      mainLogger
        .tags(LOG_TAG)
        .log(
          'search count is 0 in last search, so do not need to do this search',
          options,
        );
      return {
        ...EmptySearchRes,
        contentCount: this._lastResultContentCounts,
      };
    }

    mainLogger.tags(LOG_TAG).log('searchPosts options', options);
    this._startListenSocketSearchChange();
    const searchPromise = this._searchPostByOptions(options);
    return this._doSearch(searchPromise);
  }

  async scrollSearchPosts(): Promise<SearchedResultData> {
    mainLogger.tags(LOG_TAG).log('scrollSearchPosts');
    if (!this._searchInfo || !this._searchInfo.requestId) {
      return EmptySearchRes;
    }
    return this._doSearch(this._scrollSearchPosts(this._searchInfo.requestId));
  }

  private _needDoSearch(options: ContentSearchParams) {
    if (this._searchInfo && this._lastResultContentCounts) {
      const currentSearchOptions = _.pick(options, SEARCH_CONDITION_KEYS);
      const lastSearchOptions = _.pick(
        this._searchInfo.queryOptions,
        SEARCH_CONDITION_KEYS,
      );

      if (_.isEqual(currentSearchOptions, lastSearchOptions)) {
        const type = options.type;
        const typeId = type && SearchFilterTypes[type];
        if (typeId !== undefined) {
          const countInLastSearch =
            typeId === TYPE_ID_OF_ALL
              ? _.sum(Object.values(this._lastResultContentCounts))
              : this._lastResultContentCounts[typeId] || 0;
          return countInLastSearch > 0;
        }
      }
    }

    return true;
  }

  private async _searchPostByOptions(
    options: ContentSearchParams,
  ): Promise<SearchedResultData> {
    delete this._searchInfo;
    const [postItems, contentCounts] = await Promise.all([
      this._searchPosts(options),
      this._getContentsCount(options),
    ]);

    return {
      ...postItems,
      contentCount: this._correctContentCount(_.cloneDeep(contentCounts)),
    };
  }

  private _correctContentCount(contentCount: SearchContentTypesCount) {
    if (contentCount && this._searchInfo && this._searchInfo.filteredIds) {
      const keys = Object.keys(contentCount);
      keys.forEach(key => {
        const filteredCnt: number = this._searchInfo.filteredIds![key] || 0;
        contentCount[key] = Math.max(contentCount[key] - filteredCnt, 0);
      });

      mainLogger.tags(LOG_TAG).log('after correct', {
        needFilter: this._searchInfo.filteredIds,
        afterFilter: contentCount,
      });
    }
    return contentCount;
  }

  private async _doSearch(searchPromise: Promise<SearchedResultData>) {
    try {
      const waiter = this._setSearchTimeout();
      const searchRes = (await Promise.race([
        searchPromise,
        waiter,
      ])) as SearchedResultData;
      this._clearSearchTimeout();
      return searchRes;
    } catch (error) {
      mainLogger.tags(LOG_TAG).info('do search with error', { error });
      this._clearSearchTimeout();
      throw error;
    }
  }

  private async _searchPosts(
    options: ContentSearchParams,
  ): Promise<SearchedResultData> {
    const performanceTracer = PerformanceTracer.start();

    let results = await this._requestSearchPosts({
      ...options,
      previous_server_request_id:
        this._searchInfo && this._searchInfo.requestId,
    });
    if (
      options.scroll_size &&
      this._needContinueFetch(results, options.scroll_size)
    ) {
      mainLogger
        .tags(LOG_TAG)
        .log(
          'searchPosts, size does not match, we need to fetch more for this search',
          {
            options,
            postLen: results.posts.length,
            itemLen: results.items.length,
          },
        );
      results = await this._searchUntilMeetSize(results, options.scroll_size);
    }
    performanceTracer.end({ key: POST_PERFORMANCE_KEYS.SEARCH_POST });
    mainLogger.tags(LOG_TAG).log('searchPosts, return result = ', {
      options,
      postLen: results.posts.length,
      itemLen: results.items.length,
    });
    return results;
  }

  private _needContinueFetch(
    searchResult: SearchedResultData,
    fetchSize: number,
  ) {
    return searchResult.hasMore && searchResult.posts.length < fetchSize;
  }

  private async _searchUntilMeetSize(
    preResult: SearchedResultData,
    fetchSize: number,
  ) {
    let scrollSearchRes = await this._requestScrollSearchPosts(
      preResult.requestId,
    );
    scrollSearchRes = this._combineSearchResults(
      preResult,
      scrollSearchRes,
      preResult.requestId,
    );

    mainLogger.tags(LOG_TAG).log(' _searchUntilMeetSize -> scrollSearchRes', {
      fetchSize,
      postLen: scrollSearchRes.posts.length,
      itemLen: scrollSearchRes.items.length,
    });

    if (this._needContinueFetch(scrollSearchRes, fetchSize)) {
      const needFetchSize = fetchSize - scrollSearchRes.posts.length;
      scrollSearchRes = await this._searchUntilMeetSize(
        scrollSearchRes,
        needFetchSize,
      );
    }
    return scrollSearchRes;
  }

  private _combineSearchResults(
    resA: SearchedResultData,
    resB: SearchedResultData,
    requestId: number,
  ): SearchedResultData {
    return {
      requestId,
      posts: resA.posts.concat(resB.posts),
      items: resA.items.concat(resB.items),
      hasMore: resA.hasMore && resB.hasMore,
    };
  }

  private async _requestSearchPosts(
    options: ContentSearchParams,
  ): Promise<SearchedResultData> {
    const postRes = await SearchAPI.search(options);
    mainLogger.tags(LOG_TAG).log('_requestSearchPosts', postRes);
    return new Promise((resolve, reject) => {
      this._updateSearchInfo({
        resolve,
        reject,
        requestId: postRes.request_id,
        queryOptions: options,
        scrollSize: options.scroll_size,
      });
    });
  }

  private async _scrollSearchPosts(
    requestId: number,
  ): Promise<SearchedResultData> {
    const performanceTracer = PerformanceTracer.start();

    let result = await this._requestScrollSearchPosts(requestId);
    if (
      this._searchInfo &&
      this._searchInfo.scrollSize &&
      this._needContinueFetch(result, this._searchInfo.scrollSize)
    ) {
      mainLogger
        .tags(LOG_TAG)
        .log(
          'scrollSearchPosts, size does not match, we need to fetch more for this search',
          { postLen: result.posts.length, itemLen: result.items.length },
        );
      result = await this._searchUntilMeetSize(
        result,
        this._searchInfo.scrollSize,
      );
    }
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.SCROLL_SEARCH_POST,
    });

    mainLogger.tags(LOG_TAG).log('scrollSearchPosts, return result = ', {
      postLen: result.posts.length,
      itemLen: result.items.length,
    });
    return result;
  }

  private async _requestScrollSearchPosts(
    requestId: number,
  ): Promise<SearchedResultData> {
    if (!requestId || this._isSearchEnded()) {
      return Promise.resolve({
        requestId,
        posts: [],
        items: [],
        hasMore: false,
      });
    }

    if (this._searchInfo) {
      try {
        await SearchAPI.scrollSearch({
          search_request_id: requestId,
          scroll_request_id: this._searchInfo.scrollRequestId || 1,
        });
      } catch (error) {
        const e = ErrorParserHolder.getErrorParser().parse(error);
        if (e.isMatch({ type: ERROR_TYPES.SERVER, codes: ['DELETED'] })) {
          return Promise.resolve({
            requestId,
            posts: [],
            items: [],
            hasMore: false,
          });
        }
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        this._updateSearchInfo({
          resolve,
          reject,
        });
      });
    }

    mainLogger
      .tags(LOG_TAG)
      .info(`scrollSearchPosts, failed to find request id, ${requestId}`);

    return Promise.resolve({
      requestId,
      posts: [],
      items: [],
      hasMore: false,
    });
  }

  async endPostSearch() {
    mainLogger
      .tags(LOG_TAG)
      .log('endPostSearch, exist request', this._searchInfo);
    this._subscribeController.unsubscribe();
    this._clearSearchTimeout();
    await this._cancelLastSearch();
  }

  private async _cancelLastSearch() {
    const lastRequestId = this._searchInfo && this._searchInfo.requestId;

    lastRequestId &&
      (await SearchAPI.search({
        previous_server_request_id: this._searchInfo.requestId,
      }).catch(error => {
        mainLogger
          .tags(LOG_TAG)
          .log('PostKeySearchHandler -> catch -> error', error);
      }));

    delete this._searchInfo;
  }

  private async _getContentsCount(
    options: ContentSearchParams,
  ): Promise<SearchContentTypesCount> {
    const result = await SearchAPI.search({
      ...options,
      count_types: 1,
      type: ESearchContentTypes.ALL,
    });
    mainLogger.tags(LOG_TAG).log('_getContentsCount', { result });
    return new Promise(resolve => {
      this._updateSearchInfo({
        contentTypesRequestId: result.request_id,
        contentTypesResolver: resolve,
      });
    });
  }

  private _handleContentTypeComes(
    requestId: number,
    contentTypes: UndefinedAble<SearchContentTypesCount>,
  ) {
    if (requestId !== this._searchInfo.contentTypesRequestId || !contentTypes) {
      return;
    }

    this._notifyContentsCountComes(requestId, contentTypes);
  }

  private _handlePostsItemsComes(searchResult: SearchResult) {
    const {
      request_id: requestId,
      results = [],
      response_id: responseId = 1,
    } = searchResult;

    if (requestId !== this._searchInfo.requestId) {
      return;
    }

    const scrollRequestId = searchResult.scroll_request_id
      ? Number(searchResult.scroll_request_id)
      : 0;

    if (!this._searchInfo) {
      mainLogger.tags(LOG_TAG).log('unrecorded search response', {
        query: searchResult.query,
        request_id: searchResult.request_id,
      });
      return;
    }

    if (responseId !== 1 && (!results || results.length === 0)) {
      // when data is null or empty. if response id != 1, it means only to info app there is no more data
      // we don't need to trigger result arrival.
      // if response id = 1, keep the same work flow as match results
      this._updateSearchInfo({ isSearchEnded: true });
      return;
    }

    const currentScrollId =
      (this._searchInfo && this._searchInfo.scrollRequestId) || 0;
    if (currentScrollId === scrollRequestId) {
      const resultData: SearchedResultData = {
        requestId,
        posts: [],
        items: [],
        hasMore: true,
      };

      if (results && results.length > 0) {
        _.merge(resultData, this._handlePostsAndItems(results));
        this._updateSearchInfo({
          scrollRequestId: scrollRequestId + 1,
        });
      }

      resultData.hasMore =
        resultData.posts.length !== 0 || resultData.items.length !== 0;

      this._notifySearchResultComes(resultData);
    }
  }

  handleSearchResults = async (searchResult: SearchResult) => {
    if (!this._searchInfo) {
      this.endPostSearch();
      return;
    }

    const { content_types: contentTypes = undefined } = searchResult;

    if (contentTypes) {
      this._handleContentTypeComes(searchResult.request_id, contentTypes);
    } else {
      this._handlePostsItemsComes(searchResult);
    }
  };

  private _startListenSocketSearchChange() {
    this._subscribeController.subscribe();
  }

  private _updateSearchInfo(queryInfo: Partial<SearchRequestInfo>) {
    this._searchInfo = _.merge(this._searchInfo || {}, queryInfo);
  }

  private _notifySearchResultComes(searchedContents: SearchedResultData) {
    if (this._searchInfo && this._searchInfo.resolve) {
      mainLogger.tags(LOG_TAG).log('_notifySearchResultComes, result = ', {
        requestId: searchedContents.requestId,
        postLen: searchedContents.posts.length,
        itemLen: searchedContents.items.length,
        hasMore: searchedContents.hasMore,
      });
      this._searchInfo.resolve(searchedContents);
    }
  }

  private _handlePostsAndItems(contents: (Raw<Post> | Raw<Item>)[]) {
    const posts: Post[] = [];
    const items: Item[] = [];

    const queryInfo = this._searchInfo;
    if (queryInfo) {
      const targetGroupId = queryInfo.queryOptions.group_id;
      const objects: (Post | Item)[] = transformAll(contents);
      const filteredPosts = new Set<number>();

      const divideData = _.groupBy(objects, (value: Post | Item) => {
        const isPost = GlipTypeUtil.isExpectedType(
          value.id,
          TypeDictionary.TYPE_ID_POST,
        );
        return isPost ? 'posts' : 'items';
      });

       divideData['posts'] && (divideData['posts'] as Post[]).forEach(value => {
        if (
          value.deactivated ||
          (PostControllerUtils.isSMSPost(value as Post) ||
            !this._isGroupPost(targetGroupId, value as Post))
        ) {
          filteredPosts.add(value.id);
          this._recordFilteredIds(value.id);
        } else {
          posts.push(value);
        }
      });

      divideData['items'] && (divideData['items'] as Item[]).forEach(value => {
        if (
          value.deactivated ||
          (value.post_ids && value.post_ids.filter(x => !filteredPosts.has(x)).length === 0)
        ) {
          filteredPosts.add(value.id);
          this._recordFilteredIds(value.id);
        } else {
          items.push(value);
        }
      });
    }

    return {
      items,
      posts,
    };
  }

  private _isGroupPost(targetGroupId: UndefinedAble<number>, post: Post) {
    return !targetGroupId || post.group_id === targetGroupId;
  }

  private _recordFilteredIds(id: number) {
    if (this._searchInfo) {
      if (!this._searchInfo.filteredIds) {
        this._searchInfo.filteredIds = {};
      }
      const typeId = GlipTypeUtil.extractTypeId(id);
      const typeIdCnt = this._searchInfo.filteredIds[typeId] || 0;
      this._searchInfo.filteredIds[typeId] = typeIdCnt + 1;
    }
  }

  private _notifyContentsCountComes(
    requestId: number,
    contentCounts: SearchContentTypesCount,
  ) {
    mainLogger
      .tags(LOG_TAG)
      .log('_notifyContentsCountComes', { requestId, contentCounts });

    if (this._searchInfo && this._searchInfo.contentTypesResolver) {
      this._searchInfo.contentTypesResolver(contentCounts);
      this._lastResultContentCounts = contentCounts;
    }
  }

  private _isSearchEnded(): boolean {
    return (this._searchInfo && this._searchInfo.isSearchEnded) || false;
  }

  private _clearSearchTimeout() {
    if (this._searchResultWaiter) {
      mainLogger
        .tags(LOG_TAG)
        .log('_clearSearchTimeout', this._searchResultWaiter);
      clearTimeout(this._searchResultWaiter);
      delete this._searchResultWaiter;
    }
  }

  private _setSearchTimeout() {
    this._clearSearchTimeout();
    return new Promise(reject => {
      const tId = setTimeout(() => {
        mainLogger
          .tags(LOG_TAG)
          .log('_setSearchTimeout,  trigger', this._searchResultWaiter);
        this._clearSearchTimeout();
        reject(
          new JNetworkError(
            ERROR_CODES_NETWORK.NETWORK_ERROR,
            'retrieve search result timeout ',
          ),
        );
      }, SEARCH_TIMEOUT);
      mainLogger.tags(LOG_TAG).log('_setSearchTimeout', tId);
      this._searchResultWaiter = tId;
    });
  }
}

export { PostSearchHandler };
