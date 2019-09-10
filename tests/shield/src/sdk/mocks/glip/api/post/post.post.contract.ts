/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:21
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract, defineApiPath } from 'shield/sdk';
import { GlipPost } from '../../types';

export interface IGlipPostPost extends IApiContract {
  host: 'glip';
  path: '/api/post';
  method: 'post';
  request: {
    data: Partial<GlipPost>;
  };
  response: {
    data: GlipPost;
  };
}

export const IGlipPostPost = defineApiPath<IGlipPostPost>({
  host: 'glip',
  path: '/api/post',
  method: 'post',
});
