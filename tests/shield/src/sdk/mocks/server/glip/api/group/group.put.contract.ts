/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipGroup } from '../../types';
import { defineApiPath, IApiContract } from 'shield/sdk';

export interface IGlipGroupPut extends IApiContract {
  path: '/api/group/:id';
  method: 'put';
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

export const IGlipGroupPut = defineApiPath<IGlipGroupPut>({
  host: 'glip',
  path: '/api/group/:id',
  method: 'put',
});
