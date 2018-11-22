/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import link from '../link';

describe('Link', () => {
  it('Should return a object that contains action is ACTION.SHARED and number is 3 when ids is [1, 2, 3]', () => {
    const ids = [1, 2, 3];
    const activityData = link({ ids });
    expect(activityData.action).toEqual(ACTION.SHARED);
    expect(activityData.quantifier).toEqual(3);
  });
});
