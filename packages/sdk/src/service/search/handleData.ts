/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:05:07
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from '../../service/notificationCenter';
import { transformAll } from '../../service/utils';
import { Raw } from '../../framework/model';
import { Post } from '../../module/post/entity';
import { Item } from '../../module/item/entity';
import { GlipTypeUtil, TypeDictionary } from '../../utils/glip-type-dictionary';
import { SearchResult } from './types.d';
import { SERVICE } from '../../service/eventKey';
import SearchService from './index';

export default ({
  results,
  request_id: requestId,
  scroll_request_id,
}: SearchResult) => {
  const searchService: SearchService = SearchService.getInstance();
  // cancel the former non-active request
  if (requestId !== searchService.activeServerRequestId) {
    searchService.cancelSearchRequest(requestId);
    return;
  }
  if (!results || results.length === 0) {
    notificationCenter.emitKVChange(SERVICE.SEARCH_END);
    searchService.cancelSearchRequest(searchService.activeServerRequestId);
    return;
  }
  handleSearchResult(results);
};

function handleSearchResult(results: Raw<Post | Item>[]) {
  const transformedData: Post[] = transformAll(results);
  const posts = transformedData.filter(isPost);
  notificationCenter.emitKVChange(SERVICE.SEARCH_SUCCESS, posts);
}

function isPost(item: Post | Item): item is Post {
  const id = item.id;
  const typeId = GlipTypeUtil.extractTypeId(id);
  return typeId === TypeDictionary.TYPE_ID_POST;
}
