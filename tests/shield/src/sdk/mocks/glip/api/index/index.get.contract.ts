/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:38
 * Copyright © RingCentral. All rights reserved.
 */
import { InitialData } from '../../types';
import { defineApiPath } from '../../../../utils';
import { IApiContract } from 'shield/sdk/types';

export interface IGlipIndex extends IApiContract {
  path: '/api/index';
  method: 'get';
  response: {
    data: InitialData;
  };
}

export const IGlipIndex = defineApiPath<IGlipIndex>({
  host: 'glip',
  path: '/api/index',
  method: 'get',
});
