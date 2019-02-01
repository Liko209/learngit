/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:29
 * Copyright © RingCentral. All rights reserved.
 */

import { Raw } from '../../framework/model';
import { Post } from '../../module/post/entity';
import { Item } from '../../module/item/entity';
export type RequestId = Number;
export type QueryString = String;
export type ResponseId = Number;
export interface CancelRequestParam {
  previous_server_request_id: RequestId;
}
export interface BasicQuery extends Partial<QueryFilter> {
  scroll_size?: Number;
  slice_size?: Number;
}
interface QueryFilter {
  type?: String;
  group_id?: Number;
  begin_time: Date;
  end_time: Date;
  creator_id: Number;
}
export interface RawQuery extends BasicQuery {
  queryString: QueryString;
  clear?: Boolean;
}
export interface InitialSearchParams extends BasicQuery {
  q: QueryString;
  previous_server_request_id?: RequestId;
}
export interface QueryByPageNum {
  pageNum: Number;
}
export interface ScrollSearchParams {
  scroll_request_id: Number;
  search_request_id: Number;
}

export interface InitialSearchResp {
  request_id: RequestId;
}

export interface SearchResult {
  request_id: RequestId;
  query: QueryString;
  results?: (Raw<Post> | Raw<Item>)[];
  response_id: ResponseId;
  scroll_request_id?: RequestId;
}
