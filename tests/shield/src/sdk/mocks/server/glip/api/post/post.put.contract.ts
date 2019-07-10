/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:24
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipPost } from '../../types';

export interface IGlipPostPut extends IApiContract {
  host: 'glip';
  path: '/api/post/:id';
  method: 'put';
  query: {
    id: number;
  };
  request: {
    data: Partial<GlipPost>;
  };
  response: {
    data: GlipPost;
  };
}
