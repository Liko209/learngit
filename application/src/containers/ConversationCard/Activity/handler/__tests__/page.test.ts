/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:26
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import page from '../page';

describe('Page', () => {
  it('Should return a object that contains action is equal to the ACTION.SHARED', () => {
    const data = page();
    expect(data.action).toEqual(ACTION.SHARED);
  });
});
