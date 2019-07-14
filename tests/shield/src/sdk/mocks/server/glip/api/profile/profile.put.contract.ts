/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:12
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipProfile } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipProfilePut extends IApiContract {
  host: 'glip';
  path: '/api/profile/:id';
  method: 'put';
  pathParams: {
    id: number;
  };
  request: {
    data: Partial<GlipProfile>;
  };
  response: {
    data: GlipProfile;
  };
}

export const IGlipProfilePut = defineApiPath<IGlipProfilePut>({
  host: 'glip',
  path: '/api/profile/:id',
  method: 'put',
});
