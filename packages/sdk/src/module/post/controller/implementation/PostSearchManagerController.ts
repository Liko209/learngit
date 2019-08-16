/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-17 10:03:18
 * Copyright © RingCentral. All rights reserved.
 */

import { PostSearchHandler } from './PostSearchHandler';
import { SearchedResultData } from './types';
import { mainLogger } from 'foundation/log';
import { ContentSearchParams } from 'sdk/api/glip/search';
import { EmptySearchRes } from './constants';

type PostSearchCache = {
  key: string;
  handler: PostSearchHandler;
  creationTime: number;
};

const MAX_SEARCH_CACHE = 1;
const LOG_TAG = 'PostSearchManagerController';
class PostSearchManagerController {
  private _postSearchHandlers = new Map<string, PostSearchCache>();

  private _updateToSearchCache(key: string, handler: PostSearchHandler) {
    if (this._postSearchHandlers.size >= MAX_SEARCH_CACHE) {
      const caches = Array.from(this._postSearchHandlers.values());
      const orderedCache = caches.sort(
        (a: PostSearchCache, b: PostSearchCache) => a.creationTime - b.creationTime,
      );

      const toDeleteKey = orderedCache[0].key;
      const toDeleteHandler = this._postSearchHandlers.get(toDeleteKey);
      toDeleteHandler && toDeleteHandler.handler.endPostSearch();

      this._postSearchHandlers.delete(toDeleteKey);
    }
    this._postSearchHandlers.set(key, {
      key,
      handler,
      creationTime: Date.now(),
    });
  }

  private _getPostSearchHandler(key: string) {
    const info = this._postSearchHandlers.get(key);
    let handler = (info && info.handler) || undefined;
    if (!handler) {
      handler = new PostSearchHandler();
      this._updateToSearchCache(key, handler);
    }
    return handler;
  }

  async startSearch(options: ContentSearchParams): Promise<SearchedResultData> {
    if (options.q) {
      const handler = this._getPostSearchHandler(options.q!);
      return await handler.startSearch(options);
    }
    return EmptySearchRes;
  }

  async scrollSearch(key: string): Promise<SearchedResultData> {
    const postKeySearchCache = this._postSearchHandlers.get(key);
    if (postKeySearchCache && postKeySearchCache.handler) {
      return await postKeySearchCache.handler.scrollSearchPosts();
    }
    mainLogger
      .tags(LOG_TAG)
      .log('can not find handler of scroll search, return empty', { key });
    return EmptySearchRes;
  }

  async endSearch(key: string) {
    const postKeySearchCache = this._postSearchHandlers.get(key);
    if (postKeySearchCache && postKeySearchCache.handler) {
      await postKeySearchCache.handler.endPostSearch();
    }
    this._postSearchHandlers.delete(key);
  }
}

export { PostSearchManagerController };
