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
import { GlipTypeUtil, TypeDictionary } from '../../../../utils';
import { mainLogger } from 'foundation';
import {
  ERROR_TYPES,
  ErrorParserHolder,
  JSdkError,
  ERROR_CODES_SDK,
} from '../../../../error';

const LOG_TAG = 'PostSearchController';
const SEARCH_TIMEOUT_ERR = 'Search Time Out';
const SEARCH_TIMEOUT = 60 * 1000;
class PostSearchController {
  private _queryInfos: Map<number, SearchRequestInfo> = new Map();
  private _hasSubscribed = false;
  private _subscribeController: SubscribeController;
  constructor() {
    this._subscribeController = SubscribeController.buildSubscriptionController(
      {
        [SOCKET.SEARCH]: this.handleSearchResults,
      },
    );
  }

  async searchPosts(options: ContentSearchParams): Promise<SearchedResultData> {
    this._startListenSocketSearchChange();
    const result = await SearchAPI.search(options);
    return new Promise((resolve, reject) => {
      mainLogger.log(LOG_TAG, 'searchPosts', options);
      const timerId = this._setSearchTimeoutTimer(reject);
      this._saveSearchInfo(result.request_id, {
        resolve,
        reject,
        q: options.q as string,
        timeoutTimer: timerId,
      });
    });
  }

  private _setSearchTimeoutTimer(reject: any) {
    return setTimeout(() => {
      reject(SEARCH_TIMEOUT_ERR);
    },                SEARCH_TIMEOUT);
  }

  async scrollSearchPosts(requestId: number): Promise<SearchedResultData> {
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
        const timerId = this._setSearchTimeoutTimer(reject);
        this._updateSearchInfo(requestId, {
          resolve,
          reject,
          q: info.q,
          timeoutTimer: timerId,
        });
      });
    }

    mainLogger.warn(
      LOG_TAG,
      `scrollSearchPosts, failed to find request id, ${requestId}`,
    );

    return Promise.reject(
      new JSdkError(ERROR_CODES_SDK.GENERAL, 'failed to search more'),
    );
  }

  async endPostSearch() {
    this._endListenSocketSearchChange();
    await this._clearSearchData();
  }

  private async _clearSearchData() {
    try {
      const infos = Array.from(this._queryInfos.values());
      infos.forEach((value: SearchRequestInfo) => {
        value.timeoutTimer && clearTimeout(value.timeoutTimer);
      });

      const requestIds = Array.from(this._queryInfos.keys());
      this._queryInfos.clear();
      const promises = requestIds.map((requestId: number) => {
        return SearchAPI.search({ previous_server_request_id: requestId });
      });
      await Promise.all(promises);
    } catch (error) {
      // no error handling here.
      mainLogger.log(LOG_TAG, 'PostSearchController -> catch -> error', error);
    }
  }

  async getContentsCount(
    options: ContentSearchParams,
  ): Promise<SearchContentTypesCount> {
    this._startListenSocketSearchChange();
    options.count_types = 1;
    const result = await SearchAPI.search(options);
    return new Promise((resolve, reject) => {
      this._saveSearchInfo(result.request_id, {
        q: options.q as string,
        contentCountResolve: resolve,
      });
    });
  }

  handleSearchResults = async (searchResult: SearchResult) => {
    mainLogger.log(
      LOG_TAG,
      'handleSearchResults -> searchResult',
      searchResult,
    );
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
      mainLogger.log(LOG_TAG, 'unrecorded search response', searchResult);
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
    mainLogger.log(LOG_TAG, 'handleSearchResults', {
      currentScrollId,
      scrollRequestId,
    });
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
      info.resolve(searchedContents);
      info.timeoutTimer && clearTimeout(info.timeoutTimer);
    }
  }

  private _handlePostsAndItems(contents: (Raw<Post> | Raw<Item>)[]) {
    const objects: (Post | Item)[] = transformAll(contents);
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
    const info = this._queryInfos.get(requestId);
    if (info && info.contentCountResolve) {
      info.contentCountResolve(contentCounts);
    }
  }

  private _isSearchEnded(requestId: number): boolean {
    const info = this._queryInfos.get(requestId);
    return (info && info.isSearchEnded) || false;
  }
}

export { PostSearchController, ContentSearchParams };
