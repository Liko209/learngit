/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:10
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipProfile } from '../../types';

export interface IGlipProfileGet extends IApiContract {
  host: 'glip';
  path: '/api/profile/:id';
  method: 'get';
  query: {
    id: number;
  };
  request: {};
  response: {
    data: GlipProfile;
  };
}
