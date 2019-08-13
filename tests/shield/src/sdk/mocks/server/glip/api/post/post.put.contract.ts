/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:24
 * Copyright © RingCentral. All rights reserved.
 */

import { GlipPost } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipPostPut extends IApiContract {
  host: 'glip';
  path: '/api/post/:id';
  method: 'put';
  pathParams: {
    id: number;
  };
  request: {
    data: Partial<GlipPost>;
  };
  response: {
    data: GlipPost;
  };
}

export const IGlipPostPut = defineApiPath<IGlipPostPut>({
  host: 'glip',
  path: '/api/post/:id',
  method: 'put',
});
