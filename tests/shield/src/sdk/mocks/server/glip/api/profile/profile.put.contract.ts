/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:12
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipProfile } from '../../types';

export interface IGlipProfilePut extends IApiContract {
  host: 'glip';
  path: '/api/profile/:id';
  method: 'put';
  query: {
    id: number;
  };
  request: {
    data: Partial<GlipProfile>;
  };
  response: {
    data: GlipProfile;
  };
}
