/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:16
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import event from '../event';

describe('Event', () => {
  it('Should return a object that contains action is equal to the ACTION.UPDATED when activityData is not undefined', () => {
    const activityData = {};
    const data = event({ activityData });
    expect(data.action).toEqual(ACTION.UPDATED);
  });
  it('Should return a object that contains action is equal to the ACTION.CREATED when activityData is undefined', () => {
    const activityData = undefined;
    const data = event({ activityData });
    expect(data.action).toEqual(ACTION.CREATED);
  });
});
