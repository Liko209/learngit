/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-08-05 16:16:38
 * Copyright © RingCentral. All rights reserved.
 */

import { GlipPerson } from '../../types';
import { IApiContract, defineApiPath } from 'shield/sdk';

export interface IGlipPersonPut extends IApiContract {
  host: 'glip';
  path: '/api/person/:id';
  method: 'put';
  pathParams: {
    id: number;
  };
  request: {
    data: Partial<GlipPerson>;
  };
  response: {
    data: GlipPerson;
  };
}

export const IGlipPersonPut = defineApiPath<IGlipPersonPut>({
  host: 'glip',
  path: '/api/person/:id',
  method: 'put',
});
