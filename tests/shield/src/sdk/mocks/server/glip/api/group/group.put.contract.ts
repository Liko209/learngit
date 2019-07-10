/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:35
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipGroup } from '../../types';

export interface IGlipGroupPut extends IApiContract {
  path: '/api/group/:id';
  method: 'put';
  query: {
    id: number;
  };
  request: {
    data: Partial<GlipGroup>;
  };
  response: {
    data: GlipGroup;
  };
}
