/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-24 10:06:32
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Raw } from '../../../../framework/model';
import { Post } from '../../entity';
import { Item } from '../../../item/entity';
import { SOCKET } from '../../../../service/eventKey';
import { SubscribeController } from '../../../base/controller/SubscribeController';
import {
  SearchResult,
  SearchContentTypesCount,
  SearchedResultData,
  SearchRequestInfo,
} from './types';
import { SearchAPI, ContentSearchParams } from '../../../../api/glip/search';
import { transformAll } from '../../../../service/utils';
import {
  GlipTypeUtil,
  TypeDictionary,
  PERFORMANCE_KEYS,
  PerformanceTracerHolder,
} from '../../../../utils';
import { mainLogger } from 'foundation';
import {
  ERROR_TYPES,
  ErrorParserHolder,
  JNetworkError,
  ERROR_CODES_NETWORK,
} from '../../../../error';

const LOG_TAG = 'PostSearchController';
const SEARCH_TIMEOUT = 60 * 1000;

class PostSearchController {
  private _queryInfos: Map<number, SearchRequestInfo> = new Map();
  private _hasSubscribed = false;
  private _subscribeController: SubscribeController;
  private _searchResultWaiter: NodeJS.Timer;
  constructor() {
    this._subscribeController = SubscribeController.buildSubscriptionController(
      {
        [SOCKET.SEARCH]: this.handleSearchResults,
      },
    );
  }

  async searchPosts(options: ContentSearchParams): Promise<SearchedResultData> {
    mainLogger.tags(LOG_TAG).log('searchPosts options', options);
    this._startListenSocketSearchChange();
    return this._doSearch(this._searchPosts(options));
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
      this._clearSearchTimeout();
      throw error;
    }
  }

  private async _searchPosts(
    options: ContentSearchParams,
  ): Promise<SearchedResultData> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SEARCH_POST,
      logId,
    );

    let results = await this._requestSearchPosts(options);
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
    PerformanceTracerHolder.getPerformanceTracer().end(logId);

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
    const result = await SearchAPI.search(options);
    mainLogger.tags(LOG_TAG).log('_requestSearchPosts', result);
    return new Promise((resolve, reject) => {
      this._saveSearchInfo(result.request_id, {
        resolve,
        reject,
        q: options.q as string,
        scrollSize: options.scroll_size,
      });
    });
  }

  async scrollSearchPosts(requestId: number): Promise<SearchedResultData> {
    mainLogger.tags(LOG_TAG).log('scrollSearchPosts requestId', requestId);
    return this._doSearch(this._scrollSearchPosts(requestId));
  }

  private async _scrollSearchPosts(
    requestId: number,
  ): Promise<SearchedResultData> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SCROLL_SEARCH_POST,
      logId,
    );

    let result = await this._requestScrollSearchPosts(requestId);
    const info = this._queryInfos.get(requestId);
    if (
      info &&
      info.scrollSize &&
      this._needContinueFetch(result, info.scrollSize)
    ) {
      mainLogger
        .tags(LOG_TAG)
        .log(
          'scrollSearchPosts, size does not match, we need to fetch more for this search',
          { postLen: result.posts.length, itemLen: result.items.length },
        );
      result = await this._searchUntilMeetSize(result, info.scrollSize);
    }
    PerformanceTracerHolder.getPerformanceTracer().end(logId);

    mainLogger.tags(LOG_TAG).log('scrollSearchPosts, return result = ', {
      postLen: result.posts.length,
      itemLen: result.items.length,
    });
    return result;
  }

  private async _requestScrollSearchPosts(
    requestId: number,
  ): Promise<SearchedResultData> {
    if (this._isSearchEnded(requestId)) {
      return Promise.resolve({
        requestId,
        posts: [],
        items: [],
        hasMore: false,
      });
    }

    const info = this._queryInfos.get(requestId);
    if (info) {
      try {
        await SearchAPI.scrollSearch({
          search_request_id: requestId,
          scroll_request_id: info.scrollRequestId || 1,
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
        this._updateSearchInfo(requestId, {
          resolve,
          reject,
          q: info.q,
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
    .log(
      'endPostSearch, exist request ids:',
      Array.from(this._queryInfos.keys()),
    );
    this._endListenSocketSearchChange();
    this._clearSearchTimeout();
    this._clearSearchData();
  }

  private _clearSearchData() {
    const requestIds = Array.from(this._queryInfos.keys());
    this._queryInfos.clear();
    const promises = requestIds.map((requestId: number) => {
      return SearchAPI.search({ previous_server_request_id: requestId });
    });
    Promise.all(promises).catch(error => {
      mainLogger
        .tags(LOG_TAG)
        .log('PostSearchController -> catch -> error', error);
    });
  }

  async getContentsCount(
    options: ContentSearchParams,
  ): Promise<SearchContentTypesCount> {
    const result = await SearchAPI.search({ ...options, count_types: 1 });
    mainLogger.tags(LOG_TAG).log('getContentsCount', { result });
    return new Promise((resolve, reject) => {
      this._saveSearchInfo(result.request_id, {
        q: options.q as string,
        contentCountResolve: resolve,
      });
    });
  }

  handleSearchResults = async (searchResult: SearchResult) => {
    const {
      request_id: requestId,
      query,
      results = [],
      response_id: responseId = 1,
      content_types: contentTypes = false,
    } = searchResult;
    const scrollRequestId = searchResult.scroll_request_id
      ? Number(searchResult.scroll_request_id)
      : 0;
    const info = this._queryInfos.get(requestId);
    if (!info) {
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
      this._updateSearchInfo(requestId, { isSearchEnded: true });
      return;
    }

    const currentScrollId = (info && info.scrollRequestId) || 0;
    if (currentScrollId === scrollRequestId) {
      const resultData: SearchedResultData = {
        requestId,
        posts: [],
        items: [],
        hasMore: true,
      };

      if (results && results.length > 0) {
        _.merge(resultData, this._handlePostsAndItems(results));
        this._updateSearchInfo(requestId, {
          scrollRequestId: scrollRequestId + 1,
          q: query,
        });
      }

      resultData.hasMore =
        resultData.posts.length !== 0 || resultData.items.length !== 0;

      !contentTypes && this._notifySearchResultComes(resultData);
      contentTypes && this._notifyContentsCountComes(requestId, contentTypes);
    }
  }

  private _startListenSocketSearchChange() {
    !this._hasSubscribed && this._subscribeController.subscribe();
    this._hasSubscribed = true;
  }

  private _endListenSocketSearchChange() {
    this._hasSubscribed && this._subscribeController.unsubscribe();
    this._hasSubscribed = false;
  }

  private _saveSearchInfo(requestId: number, queryInfo: SearchRequestInfo) {
    this._queryInfos.set(requestId, queryInfo);
  }

  private _updateSearchInfo(
    requestId: number,
    partialInfo: Partial<SearchRequestInfo>,
  ) {
    const info = this._queryInfos.get(requestId);
    if (info) {
      this._queryInfos.set(requestId, _.merge(info, partialInfo));
    }
  }

  private _notifySearchResultComes(searchedContents: SearchedResultData) {
    const info = this._queryInfos.get(searchedContents.requestId);
    if (info && info.resolve) {
      mainLogger.tags(LOG_TAG).log('_notifySearchResultComes, result = ', {
        requestId: searchedContents.requestId,
        postLen: searchedContents.posts.length,
        itemLen: searchedContents.items.length,
        hasMore: searchedContents.hasMore,
      });
      info.resolve(searchedContents);
    }
  }

  private _handlePostsAndItems(contents: (Raw<Post> | Raw<Item>)[]) {
    let objects: (Post | Item)[] = transformAll(contents);
    objects = objects.filter((value: Post | Item) => {
      return !value.deactivated;
    });

    const posts: Post[] = [];
    const items: Item[] = [];
    objects.map((value: Post | Item) => {
      if (GlipTypeUtil.isExpectedType(value.id, TypeDictionary.TYPE_ID_POST)) {
        posts.push(value as Post);
      } else {
        items.push(value as Item);
      }
    });
    return {
      items,
      posts,
    };
  }

  private _notifyContentsCountComes(
    requestId: number,
    contentCounts: SearchContentTypesCount,
  ) {
    mainLogger
      .tags(LOG_TAG)
      .log('_notifyContentsCountComes', { requestId, contentCounts });
    const info = this._queryInfos.get(requestId);
    if (info) {
      info.contentCountResolve && info.contentCountResolve(contentCounts);
      this._queryInfos.delete(requestId);
    }
  }

  private _isSearchEnded(requestId: number): boolean {
    const info = this._queryInfos.get(requestId);
    return (info && info.isSearchEnded) || false;
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
    return new Promise((resolve, reject) => {
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
      },                     SEARCH_TIMEOUT);
      mainLogger.tags(LOG_TAG).log('_setSearchTimeout', tId);
      this._searchResultWaiter = tId;
    });
  }
}

export { PostSearchController, ContentSearchParams };
