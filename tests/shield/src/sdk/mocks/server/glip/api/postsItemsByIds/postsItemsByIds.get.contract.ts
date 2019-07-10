/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:15
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipPost, GlipItem } from '../../types';

export interface IGlipPostsItemsByIds extends IApiContract {
  host: 'glip';
  path: '/api/posts_items_by_ids/:ids';
  method: 'get';
  query: {
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
