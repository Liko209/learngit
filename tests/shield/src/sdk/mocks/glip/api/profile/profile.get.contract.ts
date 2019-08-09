/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:10
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipProfile } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipProfileGet extends IApiContract {
  host: 'glip';
  path: '/api/profile/:id';
  method: 'get';
  pathParams: {
    id: number;
  };
  request: {};
  response: {
    data: GlipProfile;
  };
}

export const IGlipProfileGet = defineApiPath<IGlipProfileGet>({
  host: 'glip',
  path: '/api/profile/:id',
  method: 'get',
});
