/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:20:58
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipGroup } from '../../types';

export interface IGlipTeamPut extends IApiContract {
  path: '/api/team/:id';
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
