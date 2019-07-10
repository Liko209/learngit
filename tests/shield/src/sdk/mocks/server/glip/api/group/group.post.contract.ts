/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:38
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract } from '../../../../../types';
import { GlipGroup } from '../../types';

export interface IGlipGroupPost extends IApiContract {
  path: '/api/group';
  method: 'post';
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
