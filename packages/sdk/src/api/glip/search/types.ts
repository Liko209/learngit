/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-06 16:34:20
 * Copyright © RingCentral. All rights reserved.
 */

type ContentSearchParams = {
  q?: string;
  type?: string;
  creator_id?: number;
  group_id?: number;
  fetch_count?: number;
  begin_time?: number;
  end_time?: number;
  for_at_mention?: boolean;
  previous_server_request_id?: number;
  count_types?: number;
};

type InitialSearchResponse = {
  request_id: number;
};

type ScrollSearchParams = {
  search_request_id: number;
  scroll_request_id: number;
};

type ScrollSearchResponse = {};

export {
  ContentSearchParams,
  InitialSearchResponse,
  ScrollSearchParams,
  ScrollSearchResponse,
};
