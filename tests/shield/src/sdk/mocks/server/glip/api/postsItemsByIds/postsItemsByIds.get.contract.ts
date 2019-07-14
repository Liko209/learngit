/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:15
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipPost, GlipItem } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipPostsItemsByIds extends IApiContract {
  host: 'glip';
  path: '/api/posts_items_by_ids/:ids';
  method: 'get';
  pathParams: {
    ids: string;
  };
  request: {};
  response: {
    data: {
      posts: GlipPost[];
      items: GlipItem[];
    };
  };
}

export const IGlipPostsItemsByIds = defineApiPath<IGlipPostsItemsByIds>({
  host: 'glip',
  path: '/api/posts_items_by_ids/:ids',
  method: 'get',
});
