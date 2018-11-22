/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:12
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import conference from '../conference';

describe('Conference', () => {
  it('Should return a object that contains action is equal to the ACTION.STARTED', () => {
    const data = conference();
    expect(data.action).toEqual(ACTION.STARTED);
  });
});
