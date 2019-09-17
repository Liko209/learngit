/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:29
 * Copyright © RingCentral. All rights reserved.
 */

import { Raw } from 'sdk/framework/model';
import { Item } from 'sdk/module/item/entity';
import { ContentSearchParams } from 'sdk/api/glip/search';
import { Post } from '../../entity';

export type SearchContentTypesCount = {
  [key: number]: number;
};

export type SearchResult = {
  request_id: number;
  query?: string;
  results?: (Raw<Post> | Raw<Item>)[] | null;
  response_id?: number;
  scroll_request_id?: string;
  client_request_id?: number;
  content_types?: SearchContentTypesCount;
};

export type SearchedResultData = {
  posts: Post[];
  items: Item[];
  hasMore: boolean;
  contentCount?: SearchContentTypesCount;
  requestId: number;
};

export type SearchRequestInfo = {
  queryOptions: ContentSearchParams;
  requestId?: number;
  responseId?: number;
  resolve?: any;
  reject?: any;
  scrollRequestId?: number;
  isSearchEnded?: boolean;
  scrollSize?: number;
  contentTypesRequestId?: number;
  contentTypesResolver?: any;
  filteredIds?: SearchContentTypesCount;
};

export type ProcessorInfo = {
  groupId: number;
  itemId: number;
};
