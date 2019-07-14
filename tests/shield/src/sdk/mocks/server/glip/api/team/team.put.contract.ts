/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:20:58
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipGroup } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipTeamPut extends IApiContract {
  path: '/api/team/:id';
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

export const IGlipTeamPut = defineApiPath<IGlipTeamPut>({
  host: 'glip',
  path: '/api/team/:id',
  method: 'put',
});
