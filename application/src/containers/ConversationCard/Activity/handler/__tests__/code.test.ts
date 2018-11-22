/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:09
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import code from '../code';

describe('Code', () => {
  it('Should return a object that contains action is equal to the ACTION.SHARED', () => {
    const data = code();
    expect(data.action).toEqual(ACTION.SHARED);
  });
});
