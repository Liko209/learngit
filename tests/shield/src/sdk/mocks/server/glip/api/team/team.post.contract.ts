/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipGroup } from '../../types';
import { defineApiPath, IApiContract } from 'shield/sdk';

export interface IGlipTeamPost extends IApiContract {
  path: '/api/team';
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

export const IGlipTeamPost = defineApiPath<IGlipTeamPost>({
  host: 'glip',
  path: '/api/team',
  method: 'post',
});
