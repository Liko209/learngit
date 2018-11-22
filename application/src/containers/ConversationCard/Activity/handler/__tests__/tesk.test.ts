/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:30
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../../types';

import task from '../task';

describe('Task', () => {
  it('Should return a object that contains action is ACTION.CREATED when activityData is undefined', () => {
    const activityData = undefined;
    const data = task({ activityData });
    expect(data.action).toEqual(ACTION.CREATED);
  });
  it('Should return a object that contains action is ACTION.ASSIGNED when activityData is {key: "assigned_to_ids", old_value: [] }', () => {
    const activityData = { key: 'assigned_to_ids', old_value: [] };
    const data = task({ activityData });
    expect(data.action).toEqual(ACTION.ASSIGNED);
  });

  it('Should return a object that contains action is ACTION.REASSIGNED when activityData is {key: "assigned_to_ids", old_value: [1] }', () => {
    const activityData = { key: 'assigned_to_ids', old_value: [1] };
    const data = task({ activityData });
    expect(data.action).toEqual(ACTION.REASSIGNED);
  });

  it('Should return a object that contains action is ACTION.COMPLETED when activityData is {key: "complete_boolean", value: true }', () => {
    const activityData = { key: 'complete_boolean', value: true };
    const data = task({ activityData });
    expect(data.action).toEqual(ACTION.COMPLETED);
  });

  it('Should return a object that contains action is ACTION.COMPLETED when activityData is {key: "complete_boolean", value: false }', () => {
    const activityData = { key: 'complete_boolean', value: false };
    const data = task({ activityData });
    expect(data.action).toEqual(ACTION.INCOMPLETE);
  });
});
