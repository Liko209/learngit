/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:38
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipGroup } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipGroupPost extends IApiContract {
  path: '/api/group';
  method: 'post';
  pathParams: {
    id: number;
  };
  request: {
    data: Partial<GlipGroup>;
  };
  response: {
    data: GlipGroup;
  };
}

export const IGlipGroupPost = defineApiPath<IGlipGroupPost>({
  host: 'glip',
  path: '/api/group',
  method: 'post',
});
